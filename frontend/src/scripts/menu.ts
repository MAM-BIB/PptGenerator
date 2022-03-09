import { app, BrowserWindow, Menu, MenuItem } from "electron";
import { spawn } from "child_process";
import path from "path";

import { getConfig } from "./config";

export default function initMenu() {
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
                            getConfig().presentationMasters[0].paths[0],
                            "-outPath",
                            getConfig().metaJsonPath,
                        ]);
                        bat.stdout.on("data", (data) => {
                            console.log(data.toString());
                        });

                        bat.stderr.on("data", (data) => {
                            console.error(data.toString());
                        });

                        bat.on("exit", (code) => {
                            console.log(`Child exited with code ${code}`);
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
                        openOption();
                    },
                },
            ],
        },
    ]);

    Menu.setApplicationMenu(menu);
}

let optionOpen: boolean;

function openOption() {
    if (!optionOpen) {
        const optionWindow = new BrowserWindow({
            width: 600,
            height: 600,
            resizable: false,
            useContentSize: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        const indexHTML = path.join(__dirname, "views/option.html");
        optionWindow.loadFile(indexHTML).catch((error) => {
            console.log(error);
        });
        optionOpen = true;
        optionWindow.on("close", () => {
            optionOpen = false;
        });
    }
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
