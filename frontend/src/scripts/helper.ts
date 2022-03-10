import { ipcRenderer } from "electron";

import { PopupOptions } from "./interfaces/interfaces";

export default function openPopup(options: PopupOptions) {
    ipcRenderer.invoke(
        "openWindow",
        "popup.html",
        {
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
        },
        options,
    );
}
