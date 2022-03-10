import { BrowserWindow, ipcMain, dialog } from "electron";
import { electron } from "process";
import path from "path";

export default function initIpcHandlers() {
    // Close the window, sending the ipc-message
    ipcMain.handle("closeFocusedWindow", (event) => {
        BrowserWindow.fromWebContents(event.sender)?.close();
    });

    ipcMain.handle("openDialog", async (event, options: Electron.OpenDialogOptions) => {
        const browserWindow = BrowserWindow.fromWebContents(event.sender);
        if (browserWindow) {
            return dialog.showOpenDialog(browserWindow, options);
        }
        return Promise.reject(new Error("Could not open dialog"));
    });

    ipcMain.handle(
        "openWindow",
        async (event, htmlPath: string, options: Electron.BrowserWindowConstructorOptions | undefined, data) => {
            const browserWindow = BrowserWindow.fromWebContents(event.sender);
            const windowOptions = options;
            if (browserWindow && windowOptions?.modal) {
                windowOptions.parent = browserWindow;
            }

            const window = new BrowserWindow(windowOptions);

            const indexHTML = path.join(__dirname, "views", htmlPath);

            window.loadFile(indexHTML);

            if (data) {
                window.webContents.once("dom-ready", () => {
                    window.webContents.send("data", data);
                });
            }
        },
    );
}
