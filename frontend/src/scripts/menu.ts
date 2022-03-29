import { app, BrowserWindow, Menu } from "electron";
import path from "path";

import { getConfig } from "./config";
import openPopup from "./helper/openPopup";
import isRunning, { killPpt, sleep } from "./helper/processManager";
import reload from "./helper/reload";
import scanPresentations from "./helper/scan";

/**
 * This function creates a menu for shortcuts.
 * @param mainWindow Window where the menu will exist
 */
export default function initMenu(mainWindow: BrowserWindow) {
    mainWindow.on("focus", () => {
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
                            if (isRunning("POWERPNT")) {
                                const awnser = await openPopup({
                                    text: "We detected that PowerPoint is open. Please close the process",
                                    heading: "Warning",
                                    primaryButton: "Kill PowerPoint",
                                    secondaryButton: "Cancel",
                                    answer: true,
                                });
                                if (awnser) {
                                    killPpt();
                                    while (isRunning("POWERPNT")) {
                                        // eslint-disable-next-line no-await-in-loop
                                        await sleep(1000);
                                    }
                                    scanPresentations(focusedWindow);
                                }
                            } else {
                                scanPresentations(focusedWindow);
                            }
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
    });
    mainWindow.on("blur", () => {
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
                ],
            },
        ]);

        Menu.setApplicationMenu(menu);
    });
}

/**
 * This functions opens the options
 * @param parent Browserwindow or null for no window
 */
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

    optionWindow.on("close", () => {
        parent?.focus();
    });
}
