import { ipcRenderer } from "electron";
import { spawn } from "child_process";
import path from "path";
import fsBase from "fs";

import { getConfig } from "../../config";
import { Placeholder, Presentation, Preset, PresetSection } from "../../interfaces/interfaces";
import { addAllBrowseHandler } from "../components/browseButton";
import { startLoading, stopLoading } from "../components/loading";
import openPopup from "../../helper";

const fs = fsBase.promises;

const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const nameInput = document.getElementById("name-input") as HTMLInputElement;
const pathInput = document.getElementById("path-input") as HTMLInputElement;
const savePresetToggleBtn = document.getElementById("save-preset-toggle-btn") as HTMLInputElement;
const presetPathSection = document.getElementById("preset-path") as HTMLDivElement;
const presetPathInput = document.getElementById("preset-path-input") as HTMLInputElement;

let placeholders: Placeholder[];
let presentations: Presentation[];

ipcRenderer.on("data", (event, data) => {
    presentations = data.presentations;
    placeholders = data.placeholders;
});

pathInput.value = getConfig().defaultExportPath;
presetPathInput.value = getConfig().presetPath;
addAllBrowseHandler();

savePresetToggleBtn.addEventListener("change", () => {
    presetPathSection.style.display = savePresetToggleBtn.checked ? "" : "none";
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

        createPreset(path.join(presetPath, `${name}.json`));
    }

    exportToPptx(path.join(outPath, `${name}.pptx`));
});

cancelBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});

function exportToPptx(outPath: string) {
    const positions: number[] = [];
    for (const presentation of presentations) {
        for (const section of presentation.Sections) {
            for (const slide of section.Slides) {
                if (slide.IsSelected) {
                    positions.push(slide.Position);
                }
            }
        }
    }

    const bat = spawn(getConfig().coreApplication, [
        "-mode",
        "create",
        "-inPath",
        getConfig().presentationMasters[0].paths[0],
        "-outPath",
        outPath,
        "-slidePos",
        positions.join(","),
        "-basePath",
        getConfig().basePath,
        "-deleteFirstSlide",
        "-placeholders",
        ...placeholders.map((elem) => `${elem.name},${elem.value}`),
    ]);

    bat.stderr.on("data", (d) => {
        openPopup({ text: `Error during the export:\n${d.toString()}`, heading: "Error" });
    });

    bat.on("exit", (code) => {
        if (code !== 0) {
            openPopup({ text: "The process exited with unknown errors!", heading: "Error" });
        }
        ipcRenderer.invoke("closeFocusedWindow");
    });
}

async function createPreset(savePath: string) {
    const preset: Preset = {
        path: savePath,
        sections: [],
        placeholders: [],
    };

    for (const presentation of presentations) {
        for (const section of presentation.Sections) {
            const presetSection: PresetSection = {
                name: section.Name,
                includedSlides: [],
                ignoredSlides: [],
            };
            for (const slide of section.Slides) {
                if (slide.IsSelected) {
                    presetSection.includedSlides.push(slide.Uid);
                } else {
                    presetSection.ignoredSlides.push(slide.Uid);
                }
            }
            if (presetSection.includedSlides.length > 0) {
                preset.sections.push(presetSection);
            }
        }
    }

    const presetJson = JSON.stringify(preset, null, "\t");
    fs.writeFile(savePath, presetJson);
}
