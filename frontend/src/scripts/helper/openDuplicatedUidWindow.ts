import { BrowserWindow, ipcRenderer } from "electron";

import { DuplicatedUids } from "../interfaces/interfaces";
import openWindow from "./openWindow";

const defaultWindowOptions = {
    width: 800,
    height: 650,
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

export default async function duplicatedUidWindow(options: DuplicatedUids) {
    const windowOptions = { ...defaultWindowOptions };
    if (ipcRenderer) {
        return ipcRenderer.invoke("openWindow", "DuplicatedUidWindow.html", windowOptions, options);
    }
    return openWindow(BrowserWindow.getFocusedWindow(), "DuplicatedUidWindow.html", windowOptions, options);
}
