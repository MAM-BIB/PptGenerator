import { ipcRenderer } from "electron";

import { Placeholder, Presentation } from "../../interfaces/interfaces";
import openPopup from "../../helper";

const variablesContainer = document.getElementById("variablesContainer") as HTMLDivElement;
const setBtn = document.getElementById("set-btn") as HTMLDivElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const placeholders: Placeholder[] = [];

let presentations: Presentation[];
ipcRenderer.on("data", (event, data) => {
    presentations = data;
    for (const presentation of presentations) {
        for (const section of presentation.Sections) {
            for (const slide of section.Slides) {
                for (const placeholder of slide.Placeholders) {
                    variablesContainer.appendChild(createVariableInput(placeholder, placeholders.length));
                    placeholders.push({
                        name: placeholder,
                        value: "",
                    });
                }
            }
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
    } else {
        openPopup({ text: "Please fill out all Inputs!", heading: "Error" });
    }
});

cancelBtn.addEventListener("click", async () => {
    await ipcRenderer.invoke("closeFocusedWindow");
});

function createVariableInput(varName: string, index: number): HTMLDivElement {
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
