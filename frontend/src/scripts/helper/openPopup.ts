import { BrowserWindow, ipcRenderer } from "electron";

import { PopupOptions } from "../interfaces/windows";
import openWindow from "./openWindow";

/**
 * These are the default option for the window.
 */
const defaultWindowOptions = {
    width: 400,
    height: 250,
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
export default async function openPopup(options: PopupOptions, setModal?: boolean) {
    const windowOptions = { ...defaultWindowOptions };
    windowOptions.modal = setModal ?? true;
    windowOptions.height += 20 * Math.min(options.text?.split("\n").length ?? 0, 10);
    windowOptions.width +=
        20 * Math.min(Math.max(0, ...(options.text?.split("\n").map((elem) => elem.length - 50) ?? [0])), 20);
    if (ipcRenderer) {
        return ipcRenderer.invoke("openWindow", "popup.html", windowOptions, options);
    }
    return openWindow(BrowserWindow.getFocusedWindow(), "popup.html", windowOptions, options);
}
