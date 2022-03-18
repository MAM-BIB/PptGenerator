import { app, BrowserWindow, Menu } from "electron";
import path from "path";

import { getConfig } from "./config";
import reload from "./helper/reload";
import scanPresentations from "./helper/scan";

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
                        reload(focusedWindow);
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
                    accelerator: "CmdOrCtrl+I",
                    async click(item, focusedWindow) {
                        scanPresentations(focusedWindow);
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

export function openOption(parent: BrowserWindow | null) {
    const optionWindow = new BrowserWindow({
        width: 600,
        height: 600,
        resizable: false,
        useContentSize: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
        modal: true,
        parent: parent ?? undefined,
    });
    const indexHTML = path.join(__dirname, "views/option.html");
    optionWindow.loadFile(indexHTML);
}
