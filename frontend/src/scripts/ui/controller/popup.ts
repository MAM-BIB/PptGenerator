import { ipcRenderer } from "electron";

import { PopupOptions } from "../../interfaces/interfaces";
import initTitlebar from "../components/titlebar";

const okBtn = document.getElementById("ok-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const textElement = document.getElementById("popup-text") as HTMLElement;
const headingElement = document.getElementById("popup-heading") as HTMLElement;

let options: PopupOptions;

initTitlebar({
    resizable: false,
    menuHidden: true,
});

ipcRenderer.on("data", (event, data) => {
    options = data;

    const texts = options.text?.split("\n") ?? [];
    for (const text of texts) {
        textElement.append(document.createTextNode(text));
        textElement.append(document.createElement("br"));
    }
    textElement.lastChild?.remove();

    headingElement.textContent = `${options.heading}`;
    if (options.secondaryButton) {
        cancelBtn.hidden = false;
        cancelBtn.textContent = options.secondaryButton;
    }
    if (options.primaryButton) {
        okBtn.textContent = options.primaryButton;
    }
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
