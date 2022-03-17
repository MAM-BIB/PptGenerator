import { BrowserWindow, ipcRenderer } from "electron";

import { PopupOptions } from "./interfaces/interfaces";
import { openWindow } from "./ipcHandler";

const windowOptions = {
    width: 400,
    height: 200,
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

export default async function openPopup(options: PopupOptions) {
    if (ipcRenderer) {
        return ipcRenderer.invoke("openWindow", "popup.html", windowOptions, options);
    }
    return openWindow(BrowserWindow.getFocusedWindow(), "popup.html", windowOptions, options);
}
