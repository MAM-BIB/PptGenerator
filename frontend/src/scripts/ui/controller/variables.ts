import { ipcRenderer } from "electron";

import { Placeholder, Presentation } from "../../interfaces/interfaces";
import openPopup from "../../helper";
import initTitlebar from "../components/titlebar";

const variablesContainer = document.getElementById("variablesContainer") as HTMLDivElement;
const setBtn = document.getElementById("set-btn") as HTMLDivElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;

let presentations: Presentation[];
let placeholders: Placeholder[];

initTitlebar({
    resizable: false,
    menuHidden: true,
    title: "PptGenerator-Variables",
});

ipcRenderer.on("data", (event, data) => {
    presentations = data.presentations;
    placeholders = data.placeholders;

    if (!placeholders) {
        placeholders = [];
        for (const presentation of presentations) {
            for (const section of presentation.Sections) {
                for (const slide of section.Slides) {
                    for (const placeholder of slide.Placeholders) {
                        variablesContainer.appendChild(createPlaceholderInput(placeholder, placeholders.length));
                        placeholders.push({
                            name: placeholder,
                            value: "",
                        });
                    }
                }
            }
        }
    } else {
        for (const placeholder of placeholders) {
            variablesContainer.appendChild(
                createPlaceholderInput(placeholder.name, placeholders.length, placeholder.value),
            );
        }
    }
});

setBtn.addEventListener("click", async () => {
    if (filledAllPlaceholders()) {
        await ipcRenderer.invoke(
            "openWindow",
            "export.html",
            {
                width: 500,
                height: 400,
                minWidth: 500,
                minHeight: 400,
                frame: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
                autoHideMenuBar: true,
                modal: false,
            },
            {
                presentations,
                placeholders,
            },
        );
        window.close();
    } else {
        openPopup({ text: "Please fill out all inputs!", heading: "Error" });
    }
});

cancelBtn.addEventListener("click", async () => {
    await ipcRenderer.invoke("closeFocusedWindow");
});

function createPlaceholderInput(varName: string, index: number, defaultValue = ""): HTMLDivElement {
    const variableContainer = document.createElement("div") as HTMLDivElement;
    const varLabel = document.createElement("label") as HTMLLabelElement;
    const inputContainer = document.createElement("div") as HTMLDivElement;
    const varInput = document.createElement("input") as HTMLInputElement;

    variableContainer.classList.add("section");
    varLabel.classList.add("lbl");
    inputContainer.classList.add("browse-input");
    varInput.classList.add("input-path");

    varInput.type = "text";
    varInput.id = `input-${varName}`;
    varInput.value = defaultValue;
    varInput.addEventListener("change", () => {
        placeholders[index].value = varInput.value;
    });

    varLabel.textContent = varName;
    varLabel.htmlFor = `input-${varName}`;

    inputContainer.appendChild(varInput);
    variableContainer.appendChild(varLabel);
    variableContainer.appendChild(inputContainer);

    return variableContainer;
}

function filledAllPlaceholders(): boolean {
    for (const placeholder of placeholders) {
        if (placeholder.value === "") {
            return false;
        }
    }
    return true;
}
