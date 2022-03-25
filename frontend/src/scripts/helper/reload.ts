import { BrowserWindow } from "electron";

/**
 * This function is used to reload one or all windows of the application.
 * @param window The window that will be reloaded. If not passed on all windows will be reloaded.
 */
export default function reload(window: BrowserWindow | undefined | null) {
    if (window) {
        // After overloading, refresh and close all secondary forms
        if (window.id === 1) {
            BrowserWindow.getAllWindows().forEach((win) => {
                if (win.id > 1) {
                    win.close();
                }
            });
        }
        window.reload();
    } else {
        for (const win of BrowserWindow.getAllWindows()) {
            win.focus();
            win.reload();
        }
    }
}
