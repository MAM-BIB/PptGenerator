import { BrowserWindow, ipcMain } from "electron";

// Close the window, sending the ipc-message
ipcMain.handle("closeFocusedWindow", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
});
