import { app, BrowserWindow } from "electron";
import * as path from "path";

import initIpcHandlers from "./ipcHandler";
import initMenu from "./menu";

initIpcHandlers();

app.on("ready", () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 500,
        minHeight: 400,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    initMenu();

    const indexHTML = path.join(__dirname, "views/index.html");
    win.loadFile(indexHTML);
});
