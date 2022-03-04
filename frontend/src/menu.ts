import { app, BrowserWindow, Menu } from "electron";
import path from "path";

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
                    label: "Option",
                    accelerator: "1",
                    click() {
                        openOption();
                    },
                },
            ],
        },
    ]);

    let optionOpen: boolean;

    function openOption() {
        if (!optionOpen) {
            const optionWindow = new BrowserWindow({
                width: 500,
                height: 500,
                minWidth: 500,
                minHeight: 500,
                resizable: false,
                useContentSize: true,
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
    Menu.setApplicationMenu(menu);
}
