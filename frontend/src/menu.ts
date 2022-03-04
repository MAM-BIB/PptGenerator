import { app, BrowserWindow, Menu } from "electron";
import { spawn } from "child_process";
import getConfig from "./config";

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
                        console.log("");
                        const bat = spawn(
                            "C:/Users/bib/Projects/Git/PptGenerator/backend/PptGenerator/bin/Release/netcoreapp3.1/PptGenerator.exe",
                            ["-inPath", "../backend/slides/All_slides_EN_small.pptx", "-outPath", "./test.json"],
                        );
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
