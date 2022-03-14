import { ipcRenderer } from "electron";

import { Presentation } from "../../interfaces/interfaces";

const variablesContainer = document.getElementById("variablesContainer") as HTMLDivElement;

let presentations: Presentation[];
ipcRenderer.on("data", (event, data) => {
    presentations = data;
    for (const presentation of presentations) {
        for (const section of presentation.Sections) {
            for (const slide of section.Slides) {
                for (const placeholder of slide.Placeholders) {
                    variablesContainer.appendChild(createVariableInput(placeholder));
                }
            }
        }
    }
});

function createVariableInput(varName: string): HTMLDivElement {
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

    varLabel.textContent = varName;
    varLabel.htmlFor = `input-${varName}`;

    inputContainer.appendChild(varInput);
    variableContainer.appendChild(varLabel);
    variableContainer.appendChild(inputContainer);

    return variableContainer;
}
