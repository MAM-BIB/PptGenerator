import { ipcRenderer } from "electron";

import { Placeholder, Presentation } from "../../interfaces/interfaces";
import initTitlebar from "../components/titlebar";
import openPopup from "../../helper/popup";

const variablesContainer = document.getElementById("variablesContainer") as HTMLDivElement;
const setBtn = document.getElementById("set-btn") as HTMLDivElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;

let presentations: Presentation[];
let placeholders: Placeholder[];
let firstInput = true;

initTitlebar({
    resizable: false,
    menuHidden: true,
    title: "PptGenerator-Variables",
});

ipcRenderer.on("data", (event, data) => {
    presentations = data.presentations;
    placeholders = data.placeholders;

    if (placeholders.length === 0) {
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
    variableContainer.classList.add("section");

    // Create label
    const varLabel = document.createElement("label") as HTMLLabelElement;
    varLabel.classList.add("lbl");
    varLabel.textContent = varName;
    varLabel.htmlFor = `input-${varName}`;
    variableContainer.appendChild(varLabel);

    // Create input inside a container
    const inputContainer = document.createElement("div") as HTMLDivElement;
    inputContainer.classList.add("browse-input");

    // Create input
    const varInput = document.createElement("input") as HTMLInputElement;
    varInput.type = "text";
    varInput.id = `input-${varName}`;
    varInput.value = defaultValue;
    varInput.classList.add("input-path");
    if (firstInput) {
        firstInput = false;
        varInput.autofocus = true;
        varInput.focus();
    }
    varInput.addEventListener("change", () => {
        placeholders[index].value = varInput.value;
    });
    varInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const nextInput = varInput.parentElement?.parentElement?.nextElementSibling?.getElementsByTagName(
                "INPUT",
            )[0] as HTMLInputElement;

            if (nextInput) {
                nextInput.focus();
            } else {
                setBtn.focus();
            }
        }
    });
    inputContainer.appendChild(varInput);

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
