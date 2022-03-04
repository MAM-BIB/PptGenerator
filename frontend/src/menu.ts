import { app, BrowserWindow, Menu } from "electron";
import { spawn } from "child_process";
import { getConfig, Config, PresentationMaster } from "./config";

export default function initMenu(browserWindow: BrowserWindow) {
    const menu = Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [
                {
                    label: "Open Dev tools",
                    accelerator: "F12",
                    click() {
                        browserWindow.webContents.openDevTools();
                    },
                },
                {
                    label: "Reload",
                    accelerator: "CmdOrCtrl+R",
                    click(item, focusedWindow) {
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
                    click() {
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
                        });
                    },
                },
                {
                    label: "getConfig",
                    click() {
                        getConfig();
                    },
                },
            ],
        },
    ]);

    Menu.setApplicationMenu(menu);
}
