/* eslint-disable no-await-in-loop */
import { BrowserWindow, ipcMain, dialog } from "electron";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";

import { getConfig, refreshConfig } from "./helper/config";
import openWindow from "./helper/openWindow";
import reload from "./helper/reload";
import scanPresentations from "./helper/scan";
import call from "./helper/systemcall";
import { SlideWithPathAndImg } from "./interfaces/container";
import { Presentation, Slide } from "./interfaces/presentation";
import { openOption } from "./menu";
import openPopup from "./helper/openPopup";

/**
 * This function handles ipcRenderer messages.
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

                const uids: { [uid: string]: SlideWithPathAndImg[] } = {};

                const presentationsJson = await fs.promises.readFile(getConfig().metaJsonPath, { encoding: "utf-8" });
                const presentations: Presentation[] = JSON.parse(presentationsJson) as Presentation[];
                for (const presentation of presentations) {
                    for (const slide of presentation.Sections.flatMap((section) => section.Slides)) {
                        uids[slide.Uid] = [{ path: presentation.Path, slide, imgPath: "" }];
                    }
                }

                // Clear/create tmp folder
                const tmpFolder = path.resolve(os.tmpdir(), "pptGenImgs");
                if (fs.existsSync(tmpFolder)) {
                    fs.rmSync(tmpFolder, { recursive: true });
                }
                fs.mkdirSync(tmpFolder);

                const newSlides: SlideWithPathAndImg[] = [];
                let folderId = 0;
                for (const pptxFile of pptxFiles) {
                    const tmpPath = path.join(os.tmpdir(), `pptGen.${Math.random()}.json`);
                    // eslint-disable-next-line no-await-in-loop
                    await call(getConfig().coreApplication, ["-inPath", pptxFile, "-outPath", tmpPath]);
                    const fileJson = fs.readFileSync(tmpPath, { encoding: "utf-8" });
                    const filePresentations: Presentation[] = JSON.parse(fileJson) as Presentation[];
                    for (const presentation of filePresentations) {
                        const slides: { slide: Slide; isNew: boolean }[] = [];
                        for (const slide of presentation.Sections.flatMap((section) => section.Slides)) {
                            if (uids[slide.Uid]) {
                                if (uids[slide.Uid][0].slide.Hash !== slide.Hash) {
                                    slides.push({ slide, isNew: false });
                                }
                            } else {
                                slides.push({ slide, isNew: true });
                            }
                        }
                        if (slides.length > 0) {
                            try {
                                const tmpFolderPath = path.resolve(tmpFolder, folderId.toString());
                                fs.mkdirSync(tmpFolderPath);
                                await generateImg(
                                    presentation.Path,
                                    slides.map((slide) => slide.slide.Position + 1),
                                    tmpFolderPath,
                                );

                                // Add SlideWithPathAndImgs
                                for (const slide of slides) {
                                    const slideWithPathAndImg: SlideWithPathAndImg = {
                                        path: presentation.Path,
                                        slide: slide.slide,
                                        imgPath: path.resolve(tmpFolderPath, `${slide.slide.Position + 1}.jpg`),
                                    };

                                    if (slide.isNew) {
                                        newSlides.push(slideWithPathAndImg);
                                    } else {
                                        uids[slide.slide.Uid].push(slideWithPathAndImg);
                                    }
                                }
                            } catch (error) {
                                await openPopup({
                                    text: `Could not create images!\n ${error}`,
                                    heading: "Error",
                                    answer: true,
                                });
                            }
                            folderId++;
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
                    openWindow(
                        BrowserWindow.fromWebContents(event.sender),
                        "updateSlideMaster.html",
                        {
                            width: 800,
                            height: 650,
                            minWidth: 500,
                            minHeight: 400,
                            frame: false,
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false,
                            },
                            autoHideMenuBar: true,
                            modal: true,
                        },
                        {
                            newSlides,
                            updateUids: uids,
                        },
                    );
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

/**
 * Generate slide images for specific slides
 * @param srcPath the presentation path of the slides
 * @param positions the position in the presentation
 * @param destPath the path where the images will be saved
 * @returns a Promise that resolves when the images was created
 */
async function generateImg(srcPath: string, positions: number[], destPath: string) {
    const appPath = path.resolve(getConfig().specificPicsApplication).replaceAll(" ", "` ");

    return new Promise<void>((resolve, reject) => {
        exec(
            `${appPath} "${path.resolve(srcPath)}" ${positions.join(",")} "${path.resolve(destPath)}"`,
            { shell: "powershell.exe" },
            (error) => {
                if (error) reject(error.message);
            },
        ).on("exit", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject("Program exited with unknown errors");
            }
        });
    });
}
