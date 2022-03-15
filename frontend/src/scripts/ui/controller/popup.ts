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

    if (options.answer) {
        cancelBtn.addEventListener("click", () => {
            ipcRenderer.invoke(options.answer as string, false);
        });

        okBtn.addEventListener("click", () => {
            ipcRenderer.invoke(options.answer as string, true);
        });
    } else {
        cancelBtn.addEventListener("click", () => {
            ipcRenderer.invoke("closeFocusedWindow");
        });

        okBtn.addEventListener("click", () => {
            ipcRenderer.invoke("closeFocusedWindow");
        });
    }
});
