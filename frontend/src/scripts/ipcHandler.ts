import { BrowserWindow, ipcMain, dialog } from "electron";
import { electron } from "process";

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
}
