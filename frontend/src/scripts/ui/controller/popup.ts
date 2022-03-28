import { ipcRenderer } from "electron";

import { PopupOptions } from "../../interfaces/interfaces";
import initTitlebar from "../components/titlebar";

const okBtn = document.getElementById("ok-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const textElement = document.getElementById("popup-text") as HTMLElement;
const headingElement = document.getElementById("popup-heading") as HTMLElement;

let options: PopupOptions;

/**
 * This will be called when the window opens
 */
ipcRenderer.on("data", (event, data) => {
    options = data;

    // Initialization of the custom titlebar.
    initTitlebar({
        resizable: false,
        menuHidden: true,
        closeBtnMsg: options.answer as string,
    });

    // Adds line breaks to the message
    const texts = options.text?.split("\n") ?? [];
    for (const text of texts) {
        textElement.append(document.createTextNode(text));
        textElement.append(document.createElement("br"));
    }
    textElement.lastChild?.remove();

    // sets the text for the header of the popup
    headingElement.textContent = `${options.heading}`;

    // defines the buttons on the popup window
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
