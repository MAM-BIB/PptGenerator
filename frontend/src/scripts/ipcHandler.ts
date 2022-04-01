import { BrowserWindow, ipcMain, dialog } from "electron";
import { refreshConfig } from "./helper/config";
import openWindow from "./helper/openWindow";
import reload from "./helper/reload";
import scanPresentations from "./helper/scan";
import { openOption } from "./menu";

/**
 * This function handels ipcRendere messages.
 */
export default function initIpcHandlers() {
    // Open the option window
    ipcMain.handle("openOptionWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        openOption(focusWindow);
    });

    // Close the window, sending the ipc-message
    ipcMain.handle("closeFocusedWindow", (event) => {
        BrowserWindow.fromWebContents(event.sender)?.close();
    });

    // Maximize and restore the window
    ipcMain.handle("maxAndRestoreWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        if (focusWindow?.isMaximized()) {
            focusWindow?.restore();
        } else {
            focusWindow?.maximize();
        }
    });

    // Minimize the window
    ipcMain.handle("minimizeWindow", (event) => {
        BrowserWindow.fromWebContents(event.sender)?.minimize();
    });

    // Open a dialog window
    ipcMain.handle("openDialog", async (event, options: Electron.OpenDialogOptions) => {
        const browserWindow = BrowserWindow.fromWebContents(event.sender);
        if (browserWindow) {
            return dialog.showOpenDialog(browserWindow, options);
        }
        return Promise.reject(new Error("Could not open dialog"));
    });

    // Open a new window
    ipcMain.handle(
        "openWindow",
        async (event, htmlPath: string, options: Electron.BrowserWindowConstructorOptions | undefined, data) => {
            const answer = openWindow(BrowserWindow.fromWebContents(event.sender), htmlPath, options, data);
            return answer;
        },
    );

    // Save the options
    ipcMain.handle("saveOptions", (event) => {
        refreshConfig();
        BrowserWindow.fromWebContents(event.sender)?.close();
        reload(null);
    });

    // Reload the window
    ipcMain.handle("ReloadWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        reload(focusWindow);
    });

    // Scans presentations on the window
    ipcMain.handle("ScanWindow", (event) => {
        const focusWindow = BrowserWindow.fromWebContents(event.sender);
        scanPresentations(focusWindow);
    });
}
