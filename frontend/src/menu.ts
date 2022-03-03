import { app, BrowserWindow, Menu } from "electron";

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
            ],
        },
    ]);

    Menu.setApplicationMenu(menu);
}
