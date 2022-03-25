import { ipcRenderer } from "electron";
import initTitlebar from "../components/titlebar";

const okBtn = document.getElementById("ok-btn") as HTMLButtonElement;

// Initialization of the custom titlebar.
initTitlebar({
    resizable: false,
    menuHidden: true,
});
/**
 * Adds the event for the ok button.
 */
okBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});
