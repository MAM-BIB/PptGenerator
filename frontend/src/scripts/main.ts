import { app, BrowserWindow } from "electron";
import * as path from "path";

import initMenu from "./menu";

app.on("ready", () => {
    console.log("App is ready");

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

    initMenu(win);

    const indexHTML = path.join(__dirname, "views/index.html");
    win.loadFile(indexHTML)
        .then(() => {
            // IMPLEMENT FANCY STUFF HERE
        })
        .catch((e) => console.error(e));
});
