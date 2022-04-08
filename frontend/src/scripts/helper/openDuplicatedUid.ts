import { BrowserWindow, ipcRenderer } from "electron";

import { DuplicatedUids } from "../interfaces/container";
import openWindow from "./openWindow";

/**
 * These are the default option for the window.
 */
const defaultWindowOptions = {
    width: 800,
    height: 650,
    resizable: false,
    useContentSize: true,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    },
    autoHideMenuBar: true,
    modal: true,
};

/**
 * This function opens a window with the passed settings.
 * @param options This is an object where the structure of the windows is saved.
 * @returns A promise of the type boolean.
 */
export default async function duplicatedUidWindow(options: DuplicatedUids) {
    const windowOptions = { ...defaultWindowOptions };
    if (ipcRenderer) {
        return ipcRenderer.invoke("openWindow", "duplicatedUid.html", windowOptions, options);
    }
    return openWindow(BrowserWindow.getFocusedWindow(), "duplicatedUid.html", windowOptions, options);
}
