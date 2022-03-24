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

initTitlebar({
    resizable: false,
    menuHidden: true,
    title: "PptGenerator-Export",
});

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

nameInput.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") {
        e.preventDefault();
        exportBtn.focus();
    }
});

savePresetToggleBtn.addEventListener("change", () => {
    presetPathSection.style.display = savePresetToggleBtn.checked ? "" : "none";
});

savePresetToggleBtn.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") {
        savePresetToggleBtn.checked = !savePresetToggleBtn.checked;
        presetPathSection.style.display = savePresetToggleBtn.checked ? "" : "none";
    }
});

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

    if (savePresetToggleBtn.checked) {
        const presetPath = presetPathInput.value;
        if (!fsBase.existsSync(presetPath)) {
            openPopup({ text: "The selected preset directory does not exist!", heading: "Error" });
            stopLoading();
            return;
        }

        createPreset(path.join(presetPath, `${name}.json`), presentations, placeholders);
    }

    exportToPptx(path.join(outPath, `${name}.pptx`));
});

cancelBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});

interface Positions {
    [path: string]: number[];
}

async function exportToPptx(outPath: string) {
    const positions: Positions = {};

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

    ipcRenderer.invoke("closeFocusedWindow");
}

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
