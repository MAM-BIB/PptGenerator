import { BrowserWindow, ipcMain, dialog } from "electron";
import fs from "fs";
import path from "path";
import os from "os";

import { getConfig, refreshConfig } from "./helper/config";
import openWindow from "./helper/openWindow";
import reload from "./helper/reload";
import scanPresentations from "./helper/scan";
import call from "./helper/systemcall";
import { SlideWithPath } from "./interfaces/container";
import { Presentation } from "./interfaces/presentation";
import { openOption } from "./menu";

/**
 * This function handels ipcRendere messages.
 */
export default function initIpcHandlers() {
    // Open the option window
    ipcMain.handle("openOptionWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        openOption(focusWindow);
    });

    // Close the window, sending the ipc-message
    ipcMain.handle("closeFocusedWindow", (event) => {
        BrowserWindow.fromWebContents(event.sender)?.close();
    });

    // Maximize and restore the window
    ipcMain.handle("maxAndRestoreWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        if (focusWindow?.isMaximized()) {
            focusWindow?.restore();
        } else {
            focusWindow?.maximize();
        }
    });

    // Minimize the window
    ipcMain.handle("minimizeWindow", (event) => {
        BrowserWindow.fromWebContents(event.sender)?.minimize();
    });

    // Open a dialog window
    ipcMain.handle("openDialog", async (event, options: Electron.OpenDialogOptions) => {
        const browserWindow = BrowserWindow.fromWebContents(event.sender);
        if (browserWindow) {
            return dialog.showOpenDialog(browserWindow, options);
        }
        return Promise.reject(new Error("Could not open dialog"));
    });

    // scanFolder
    ipcMain.handle("scanFolder", async (event) => {
        const options: Electron.OpenDialogOptions = {
            properties: ["openDirectory"],
        };

        const browserWindow = BrowserWindow.fromWebContents(event.sender);
        if (browserWindow) {
            const openDialogReturnValue = await dialog.showOpenDialog(browserWindow, options);
            if (!openDialogReturnValue.canceled) {
                const folder = openDialogReturnValue.filePaths[0];
                const pptxFiles = getAllFiles(folder, ".pptx");

                const uids: { [uid: string]: SlideWithPath[] } = {};

                const presentationsJson = await fs.promises.readFile(getConfig().metaJsonPath, { encoding: "utf-8" });
                const presentations: Presentation[] = JSON.parse(presentationsJson) as Presentation[];
                for (const presentation of presentations) {
                    for (const slide of presentation.Sections.flatMap((section) => section.Slides)) {
                        uids[slide.Uid] = [{ path: presentation.Path, slide }];
                    }
                }

                const newSlides: SlideWithPath[] = [];
                for (const pptxFile of pptxFiles) {
                    const tmpPath = path.join(os.tmpdir(), `pptGen.${Math.random()}.json`);
                    // eslint-disable-next-line no-await-in-loop
                    await call(getConfig().coreApplication, ["-inPath", pptxFile, "-outPath", tmpPath]);
                    const fileJson = fs.readFileSync(tmpPath, { encoding: "utf-8" });
                    const filePresentations: Presentation[] = JSON.parse(fileJson) as Presentation[];
                    for (const presentation of filePresentations) {
                        for (const slide of presentation.Sections.flatMap((section) => section.Slides)) {
                            if (uids[slide.Uid]) {
                                if (uids[slide.Uid][0].slide.Hash !== slide.Hash) {
                                    uids[slide.Uid].push({ path: presentation.Path, slide });
                                }
                            } else {
                                newSlides.push({ path: presentation.Path, slide });
                            }
                        }
                    }
                    fs.rmSync(tmpPath);
                }

                let hasKeys = false;
                for (const uid in uids) {
                    if (Object.prototype.hasOwnProperty.call(uids, uid)) {
                        const slideWithPath = uids[uid];
                        if (slideWithPath.length === 1) {
                            delete uids[uid];
                        } else {
                            hasKeys = true;
                        }
                    }
                }

                if (hasKeys || newSlides.length > 0) {
                    openWindow(BrowserWindow.fromWebContents(event.sender), "updateSlideMaster.html", options, {
                        newSlides,
                        updateUids: uids,
                    });
                }
            }
        }
    });

    // Open a new window
    ipcMain.handle(
        "openWindow",
        async (event, htmlPath: string, options: Electron.BrowserWindowConstructorOptions | undefined, data) => {
            const answer = openWindow(BrowserWindow.fromWebContents(event.sender), htmlPath, options, data);
            return answer;
        },
    );

    // Save the options
    ipcMain.handle("saveOptions", (event) => {
        refreshConfig();
        BrowserWindow.fromWebContents(event.sender)?.close();
        reload(null);
    });

    // Reload the window
    ipcMain.handle("ReloadWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        reload(focusWindow);
    });

    // Scans presentations on the window
    ipcMain.handle("ScanWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        scanPresentations(focusWindow);
    });
}

/**
 * Get all files recursively of the defined type
 * @param folder the rot folder
 * @param type only get files ending with type
 * @returns all files of the defined type
 */
function getAllFiles(folder: string, type: string): string[] {
    const files: string[] = [];
    const dirents = fs.readdirSync(folder, { withFileTypes: true });

    for (const dirent of dirents) {
        if (dirent.isDirectory()) {
            files.push(...getAllFiles(path.resolve(folder, dirent.name), type));
        } else if (dirent.name.endsWith(type)) {
            files.push(path.resolve(folder, dirent.name));
        }
    }
    return files;
}
