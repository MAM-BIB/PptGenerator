import { BrowserWindow, ipcMain, dialog } from "electron";
import { refreshConfig } from "./config";
import openWindow from "./helper/openWindow";
import reload from "./helper/reload";
import scanPresentations from "./helper/scan";
import { openOption } from "./menu";

export default function initIpcHandlers() {
    ipcMain.handle("openOptionWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        openOption(focusWindow);
    });

    // Close the window, sending the ipc-message
    ipcMain.handle("closeFocusedWindow", (event) => {
        BrowserWindow.fromWebContents(event.sender)?.close();
    });

    ipcMain.handle("maxAndRestoreWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        if (focusWindow?.isMaximized()) {
            focusWindow?.restore();
        } else {
            focusWindow?.maximize();
        }
    });

    ipcMain.handle("minimizeWindow", (event) => {
        BrowserWindow.fromWebContents(event.sender)?.minimize();
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
            const answer = openWindow(BrowserWindow.fromWebContents(event.sender), htmlPath, options, data);
            return answer;
        },
    );

    ipcMain.handle("saveOptions", (event) => {
        refreshConfig();
        BrowserWindow.fromWebContents(event.sender)?.close();
        reload(null);
    });

    ipcMain.handle("ReloadWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        reload(focusWindow);
    });

    ipcMain.handle("ScanWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        scanPresentations(focusWindow);
    });
}
