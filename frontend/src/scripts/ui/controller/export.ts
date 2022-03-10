import { ipcRenderer } from "electron";
import { spawn } from "child_process";
import path from "path";
import fsBase from "fs";

import { getConfig } from "../../config";
import { Presentation, Preset, PresetSection } from "../../interfaces/interfaces";
import { addAllBrowseHandler } from "../components/browseButton";
import { startLoading, stopLoading } from "../components/loading";

const fs = fsBase.promises;

const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const nameInput = document.getElementById("name-input") as HTMLInputElement;
const pathInput = document.getElementById("path-input") as HTMLInputElement;
const savePresetToggleBtn = document.getElementById("save-preset-toggle-btn") as HTMLInputElement;
const presetPathSection = document.getElementById("preset-path") as HTMLDivElement;
const presetPathInput = document.getElementById("preset-path-input") as HTMLInputElement;

let presentations: Presentation[];

ipcRenderer.on("data", (event, data) => {
    presentations = data;
    console.log("presentations", presentations);
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
        alert("Please enter a name!");
        stopLoading();
        return;
    }
    if (outPath.length === 0) {
        alert("Please enter a name!");
        stopLoading();
        return;
    }
    if (!fsBase.existsSync(outPath)) {
        alert("The selected directory does not exist!");
        stopLoading();
        return;
    }

    if (name.endsWith(".pptx")) {
        name = name.substring(0, name.length - 5);
    }

    if (savePresetToggleBtn.checked) {
        const presetPath = presetPathInput.value;
        if (!fsBase.existsSync(presetPath)) {
            alert("The selected directory for the preset does not exist!");
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
    ]);

    bat.stderr.on("data", (d) => {
        alert(d.toString());
    });

    bat.on("exit", (code) => {
        console.log(`Child exited with code ${code}`);
        if (code !== 0) {
            alert("The process exited with unkown errors!");
        }
        ipcRenderer.invoke("closeFocusedWindow");
    });
}

async function createPreset(savePath: string) {
    const preset: Preset = {
        path: savePath,
        sections: [],
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
