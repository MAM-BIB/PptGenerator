import { BrowserWindow, ipcMain } from "electron";
import path from "path";

import { Presentation } from "../interfaces/presentation";
import { Placeholder } from "../interfaces/preset";
import { PopupOptions } from "../interfaces/windows";
import { DuplicatedUids } from "../interfaces/container";

/**
 * This function is used to open any new Window
 * @param browserWindow You can pass a window to open.
 * @param htmlPath The path of the html file for the window.
 * @param options The Option for the structure of the window.
 * @param data Some data from the previous window.
 * @returns A promise of the type boolean.
 */
export default async function openWindow(
    browserWindow: BrowserWindow | null,
    htmlPath: string,
    options: Electron.BrowserWindowConstructorOptions | undefined,
    data: PopupOptions | Presentation[] | Placeholder[] | DuplicatedUids | undefined,
) {
    const windowOptions = options;

    if (windowOptions && (data as PopupOptions).text) {
        windowOptions.parent = browserWindow ?? undefined;
    } else if (browserWindow && windowOptions?.modal) {
        windowOptions.parent = browserWindow.getParentWindow() ?? browserWindow;
    }

    const window = new BrowserWindow(windowOptions);

    const indexHTML = path.join(__dirname, "../views", htmlPath);

    window.loadFile(indexHTML);

    window?.on("close", () => {
        if (window.getParentWindow()) {
            window.getParentWindow()?.focus();
        } else {
            browserWindow?.focus();
        }
    });

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
