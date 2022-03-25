import { BrowserWindow, ipcMain } from "electron";
import path from "path";
import { Placeholder, PopupOptions, Presentation } from "../interfaces/interfaces";

export default async function openWindow(
    browserWindow: BrowserWindow | null,
    htmlPath: string,
    options: Electron.BrowserWindowConstructorOptions | undefined,
    data: PopupOptions | Presentation[] | Placeholder[] | undefined,
) {
    const windowOptions = options;
    if (browserWindow && windowOptions?.modal) {
        windowOptions.parent = browserWindow;
    }

    const window = new BrowserWindow(windowOptions);

    const indexHTML = path.join(__dirname, "../views", htmlPath);

    window.loadFile(indexHTML);

    window?.on("close", () => {
        browserWindow?.focus();
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
