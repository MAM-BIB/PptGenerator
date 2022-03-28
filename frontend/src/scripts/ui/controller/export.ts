/* eslint-disable no-await-in-loop */
import { ipcRenderer } from "electron";
import path from "path";
import fsBase from "fs";

import { getConfig } from "../../config";
import { Placeholder, Presentation } from "../../interfaces/interfaces";
import { addAllBrowseHandler } from "../components/browseButton";
import { startLoading, stopLoading } from "../components/loading";
import initTitlebar from "../components/titlebar";
import openPopup from "../../helper/openPopup";
import call from "../../helper/systemcall";
import createPreset from "../components/createPreset";

const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const nameInput = document.getElementById("name-input") as HTMLInputElement;
const pathInput = document.getElementById("path-input") as HTMLInputElement;
const savePresetToggleBtn = document.getElementById("save-preset-toggle-btn") as HTMLInputElement;
const presetPathSection = document.getElementById("preset-path") as HTMLDivElement;
const presetPathInput = document.getElementById("preset-path-input") as HTMLInputElement;

let placeholders: Placeholder[];
let presentations: Presentation[];

// Initialization of the custom titlebar.
initTitlebar({
    resizable: false,
    menuHidden: true,
    title: "PptGenerator-Export",
});

/**
 * This will be called when the window opens
 */
ipcRenderer.on("data", (event, data) => {
    presentations = data.presentations;
    if (data.placeholders) {
        placeholders = data.placeholders;
    } else {
        placeholders = [];
    }
});

pathInput.value = getConfig().defaultExportPath;
presetPathInput.value = getConfig().presetPath;
addAllBrowseHandler();

/**
 * Add the event to the input for the name of the presentation.
 */
nameInput.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") {
        e.preventDefault();
        exportBtn.focus();
    }
});

/**
 * Add a event to the toggle button for the preset creation.
 */
savePresetToggleBtn.addEventListener("change", () => {
    presetPathSection.style.display = savePresetToggleBtn.checked ? "" : "none";
});

/**
 * Add a event to the toggle button for the preset creation.
 */
savePresetToggleBtn.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") {
        savePresetToggleBtn.checked = !savePresetToggleBtn.checked;
        presetPathSection.style.display = savePresetToggleBtn.checked ? "" : "none";
    }
});

/**
 * Add the event to the export button for the preset creation.
 */
exportBtn.addEventListener("click", () => {
    startLoading();

    let name = nameInput.value;
    const outPath = pathInput.value;

    // Validate input
    if (name.length === 0) {
        openPopup({ text: "Please enter a name!", heading: "Error" });
        stopLoading();
        return;
    }
    if (outPath.length === 0) {
        openPopup({ text: "Please choose a location!", heading: "Error" });
        stopLoading();
        return;
    }
    if (!fsBase.existsSync(outPath)) {
        openPopup({ text: "The selected location directory does not exist!", heading: "Error" });
        stopLoading();
        return;
    }

    if (name.endsWith(".pptx")) {
        name = name.substring(0, name.length - 5);
    }

    // creates preset if checked
    if (savePresetToggleBtn.checked) {
        const presetPath = presetPathInput.value;
        if (!fsBase.existsSync(presetPath)) {
            openPopup({ text: "The selected preset directory does not exist!", heading: "Error" });
            stopLoading();
            return;
        }

        createPreset(path.join(presetPath, `${name}.json`), presentations, placeholders);
    }

    // creates the pptx-file
    exportToPptx(path.join(outPath, `${name}.pptx`));
});

/**
 * Add the event to the cancel button for the preset creation.
 */
cancelBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});

interface Positions {
    [path: string]: number[];
}

/**
 *
 * @param outPath The Path where the pptx file will be saved
 */
async function exportToPptx(outPath: string) {
    const positions: Positions = {};

    // prepares the date for the creation.
    for (const presentation of presentations) {
        for (const section of presentation.Sections) {
            for (const slide of section.Slides) {
                if (slide.IsSelected) {
                    if (!positions[presentation.Path]) {
                        positions[presentation.Path] = [];
                    }
                    positions[presentation.Path].push(slide.Position);
                }
            }
        }
    }

    let firstPresentation = true;
    let nr = Object.keys(positions).length;

    for (const inPath in positions) {
        if (Object.prototype.hasOwnProperty.call(positions, inPath)) {
            nr--;

            // calls wait for the new presentation to be created.
            await copyPresentation(
                inPath,
                outPath,
                positions[inPath].join(","),
                firstPresentation ? getConfig().basePath : null,
                nr === 0,
            );
            firstPresentation = false;
        }
    }

    // closes the window after completion
    ipcRenderer.invoke("closeFocusedWindow");
}

/**
 * This function calls the core application with the passed on arguments and waits for the application to finish.
 * The application should create a new .pptx file.
 * @param inPath The path from which the slides will be copied.
 * @param outPath The path where the new presentation will be saved.
 * @param positions The positions of the slides that will be copied.
 * @param basePath The path of a presentation that will be used to insert the copied slides
 * @param deleteFirstSlide Boolean if the first slide of the created presentation will be deleted.
 * @returns A promise if the export was successful of was rejected.
 */
async function copyPresentation(
    inPath: string,
    outPath: string,
    positions: string,
    basePath?: string | null,
    deleteFirstSlide?: boolean,
) {
    try {
        await call(getConfig().coreApplication, [
            "-mode",
            "create",
            "-inPath",
            inPath,
            "-outPath",
            outPath,
            "-slidePos",
            positions,
            basePath ? "-basePath" : "",
            basePath ?? "",
            deleteFirstSlide ? "-deleteFirstSlide" : "",
            "-placeholders",
            ...placeholders.map((elem) => `${elem.name},${elem.value}`),
        ]);
    } catch (error) {
        await openPopup({
            text: `The process exited with errors!\n${error}`,
            heading: "Error",
            answer: true,
        });
    }

    return new Promise((resolve) => {
        resolve(true);
    });
}
