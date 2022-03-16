import { app, BrowserWindow } from "electron";
import * as path from "path";

import initIpcHandlers from "./ipcHandler";
import initMenu from "./menu";

initIpcHandlers();

app.on("ready", () => {
    const window = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 720,
        minHeight: 400,
        frame: false,
        // titleBarStyle: "hidden",
        // titleBarOverlay: {
        //     color: "#2f3241",
        //     symbolColor: "#74b1be",
        // },

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    initMenu(window);

    const indexHTML = path.join(__dirname, "views/index.html");
    window.loadFile(indexHTML);
});
