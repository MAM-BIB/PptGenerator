import { BrowserWindow, ipcRenderer } from "electron";

import { PopupOptions } from "./interfaces/interfaces";
import { openWindow } from "./ipcHandler";

const windowOptions = {
    width: 400,
    height: 200,
    resizable: false,
    useContentSize: true,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    },
    autoHideMenuBar: true,
    modal: true,
};

export default function openPopup(options: PopupOptions) {
    if (ipcRenderer) {
        ipcRenderer.invoke("openWindow", "popup.html", windowOptions, options);
    } else {
        openWindow(BrowserWindow.getFocusedWindow(), "popup.html", windowOptions, options);
    }
}
