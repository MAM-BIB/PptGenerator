import { app, BrowserWindow, Menu, MenuItem } from "electron";
import { spawn } from "child_process";
import path from "path";

import { getConfig } from "./config";
import openPopup from "./helper";

export default function initMenu(mainWindow: BrowserWindow) {
    const menu = Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [
                {
                    label: "Open Dev tools",
                    accelerator: "F12",
                    click(item, focusedWindow) {
                        focusedWindow?.webContents.openDevTools();
                        if (focusedWindow !== undefined && focusedWindow.getSize()[0] < 800) {
                            focusedWindow.setSize(800, focusedWindow.getSize()[1]);
                        }
                    },
                },
                {
                    label: "Reload",
                    accelerator: "CmdOrCtrl+R",
                    click(item, focusedWindow) {
                        reload(item, focusedWindow);
                    },
                },
                {
                    label: "Exit",
                    accelerator: "Alt+F4",
                    click() {
                        app.quit();
                    },
                },
                {
                    label: "Scan Presentation",
                    click(item, focusedWindow) {
                        const bat = spawn(getConfig().coreApplication, [
                            "-inPath",
                            ...([] as string[])
                                .concat(...getConfig().presentationMasters.map((master) => master.paths))
                                .map((elem) => path.normalize(elem))
                                .filter((value, index, array) => array.indexOf(value) === index),
                            "-outPath",
                            getConfig().metaJsonPath,
                        ]);

                        bat.stderr.on("data", (d) => {
                            const options = { text: `Error during the scan:\n${d?.toString()}`, heading: "Error" };

                            openPopup(options);
                        });
                        bat.on("exit", (code) => {
                            if (code !== 0) {
                                openPopup({ text: "The process exited with unknown errors!", heading: "Error" });
                            }
                            reload(item, focusedWindow);
                        });
                    },
                },
                {
                    label: "getConfig",
                    click() {
                        getConfig();
                    },
                },
                {
                    label: "Option",
                    accelerator: "CmdOrCtrl+O",
                    click() {
                        openOption(mainWindow);
                    },
                },
            ],
        },
    ]);

    Menu.setApplicationMenu(menu);
}

function openOption(parent: BrowserWindow) {
    const optionWindow = new BrowserWindow({
        width: 600,
        height: 600,
        resizable: false,
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
        modal: true,
        parent,
    });
    const indexHTML = path.join(__dirname, "views/option.html");
    optionWindow.loadFile(indexHTML);
}

function reload(item: MenuItem, focusedWindow: BrowserWindow | undefined) {
    if (focusedWindow) {
        // After overloading, refresh and close all secondary forms
        if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach((win) => {
                if (win.id > 1) {
                    win.close();
                }
            });
        }
        focusedWindow.reload();
    }
}
