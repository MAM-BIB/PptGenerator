import { ipcRenderer } from "electron";

import { Presentation } from "../../interfaces/presentation";
import { Placeholder } from "../../interfaces/preset";
import initTitlebar from "../components/titlebar";
import openPopup from "../../helper/openPopup";
import { SlideWithPath } from "../../interfaces/container";

const variablesContainer = document.getElementById("variablesContainer") as HTMLDivElement;
const setBtn = document.getElementById("set-btn") as HTMLDivElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;

let presentations: Presentation[];
let selectedSlideWithPath: SlideWithPath[];
let placeholders: Placeholder[];
let firstInput = true;

// Initialization of the custom titlebar.
initTitlebar({
    resizable: false,
    menuHidden: true,
    title: "PptGenerator-Variables",
});

/**
 * This will be called when the window opens
 */
ipcRenderer.on(
    "data",
    (
        event,
        data: {
            presentations: Presentation[];
            selectedSlideWithPath: SlideWithPath[];
            placeholders: Placeholder[];
        },
    ) => {
        presentations = data.presentations;
        selectedSlideWithPath = data.selectedSlideWithPath;
        placeholders = [];

        for (const placeholder of new Set<string>(
            selectedSlideWithPath.flatMap((slideWithPath) => slideWithPath.slide.Placeholders),
        )) {
            const value = data.placeholders.find((p) => p.name === placeholder)?.value ?? "";
            variablesContainer.appendChild(createPlaceholderInput(placeholder, placeholders.length, value));
            placeholders.push({
                name: placeholder,
                value,
            });
        }
    },
);

/**
 * Adds event to the save button
 */
setBtn.addEventListener("click", async () => {
    // if inputs have been filled open the export windows and pass placeholders on
    // and close window.
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
                modal: true,
            },
            {
                presentations,
                selectedSlideWithPath,
                placeholders,
            },
        );
        window.close();
    } else {
        // if not filled ope popup with warning
        openPopup({ text: "Please fill out all inputs!", heading: "Error" });
    }
});

/**
 * Adds event for the cancel button
 */
cancelBtn.addEventListener("click", async () => {
    await ipcRenderer.invoke("closeFocusedWindow");
});

/**
 * This function creates a div element with input fields for all placeholders.
 * @param varName Name of the Placeholder.
 * @param index index of the placeholder in the array.
 * @param defaultValue default value for the input field.
 * @returns A html div element.
 */
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

/**
 * This function checks if all input fields have been filled with values.
 * @returns A boolean if all inputs have been filled out.
 */
function filledAllPlaceholders(): boolean {
    for (const placeholder of placeholders) {
        if (placeholder.value === "") {
            return false;
        }
    }
    return true;
}
