import { app, BrowserWindow } from "electron";
import * as path from "path";

import initIpcHandlers from "./ipcHandler";
import initMenu from "./menu";

// Initialize the ip Handlers
initIpcHandlers();

// When application can start
app.on("ready", () => {
    // Open main window
    const window = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 720,
        minHeight: 500,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Initializes the meanu of the main window
    initMenu(window);

    // Loads the index.html as window structure
    const indexHTML = path.join(__dirname, "views/index.html");
    window.loadFile(indexHTML);
});
