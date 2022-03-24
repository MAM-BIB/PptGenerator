import { BrowserWindow } from "electron";

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
