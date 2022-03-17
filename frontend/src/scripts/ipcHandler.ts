import { BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { refreshConfig } from "./config";
import reload from "./helper/reload";
import { PopupOptions, Presentation } from "./interfaces/interfaces";

export default function initIpcHandlers() {
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
}

export async function openWindow(
    browserWindow: BrowserWindow | null,
    htmlPath: string,
    options: Electron.BrowserWindowConstructorOptions | undefined,
    data: PopupOptions | Presentation[], // TODO: add missing types
) {
    const windowOptions = options;
    if (browserWindow && windowOptions?.modal) {
        windowOptions.parent = browserWindow;
    }

    const window = new BrowserWindow(windowOptions);

    const indexHTML = path.join(__dirname, "views", htmlPath);

    window.loadFile(indexHTML);

    if (data) {
        if ((data as PopupOptions).answer) {
            const popupOptions = data as PopupOptions;
            popupOptions.answer = `answer${Math.random() * 1000}`;

            window.webContents.once("dom-ready", () => {
                window.webContents.send("data", data);
            });

            return new Promise<boolean>((resolve) => {
                ipcMain.handle(popupOptions.answer as string, (event, answer: boolean) => {
                    BrowserWindow.fromWebContents(event.sender)?.close();
                    resolve(answer);
                });
            });
        }
        window.webContents.once("dom-ready", () => {
            window.webContents.send("data", data);
        });
    }

    return new Promise((resolve) => {
        resolve(false);
    });
}
