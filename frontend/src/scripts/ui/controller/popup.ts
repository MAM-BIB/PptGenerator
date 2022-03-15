import { ipcRenderer } from "electron";

import { PopupOptions } from "../../interfaces/interfaces";

const okBtn = document.getElementById("ok-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const textElement = document.getElementById("popup-text") as HTMLElement;
const headingElement = document.getElementById("popup-heading") as HTMLElement;

let options: PopupOptions;

ipcRenderer.on("data", (event, data) => {
    options = data;

    textElement.textContent = `${options.text}`;
    headingElement.textContent = `${options.heading}`;
    if (options.secondaryButton) {
        cancelBtn.hidden = false;
        cancelBtn.textContent = options.secondaryButton;
    }
    if (options.primaryButton) {
        okBtn.textContent = options.primaryButton;
    }
});

cancelBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});

okBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});
