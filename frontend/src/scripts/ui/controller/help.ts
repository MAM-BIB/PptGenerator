import { ipcRenderer } from "electron";
import initTitlebar from "../components/titlebar";

const okBtn = document.getElementById("ok-btn") as HTMLButtonElement;

initTitlebar({
    resizable: false,
    menuHidden: true,
});

okBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});
