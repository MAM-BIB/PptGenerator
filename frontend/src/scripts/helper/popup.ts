import { BrowserWindow, ipcRenderer } from "electron";

import { PopupOptions } from "../interfaces/interfaces";
import { openWindow } from "../ipcHandler";

const defaultWindowOptions = {
    width: 400,
    height: 200,
    resizable: true,
    useContentSize: true,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    },
    autoHideMenuBar: true,
    modal: true,
};

export default async function openPopup(options: PopupOptions) {
    const windowOptions = { ...defaultWindowOptions };
    windowOptions.height += 20 * Math.min(options.text?.split("\n").length ?? 0, 10);
    windowOptions.width +=
        20 * Math.min(Math.max(0, ...(options.text?.split("\n").map((elem) => elem.length - 25) ?? [0])), 20);
    if (ipcRenderer) {
        return ipcRenderer.invoke("openWindow", "popup.html", windowOptions, options);
    }
    return openWindow(BrowserWindow.getFocusedWindow(), "popup.html", windowOptions, options);
}
