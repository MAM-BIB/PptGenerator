import fsBase from "fs";
import path from "path";
import { ipcRenderer, OpenDialogReturnValue } from "electron";
import { spawn } from "child_process";

import { Presentation, Preset, Placeholder, PresetSection } from "../../interfaces/interfaces";
import { getConfig } from "../../config";
import SectionElement from "../components/sectionElement";
import createPresentationName from "../components/presentationName";
import openPopup from "../../helper";

const fs = fsBase.promises;
const { metaJsonPath } = getConfig();

const sectionContainer = document.querySelector(".presentation-slide-container.left") as HTMLElement;
const selectedSectionContainer = document.querySelector(".presentation-slide-container.right") as HTMLElement;
const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const loadFileBtn = document.getElementById("load-preset-btn") as HTMLButtonElement;
const sectionElements: SectionElement[] = [];

let presentations: Presentation[];
let loadedPreset: Preset;
let placeholders: Placeholder[] | undefined;

async function read() {
    try {
        const presentationsJson = await fs.readFile(metaJsonPath, { encoding: "utf-8" });
        presentations = JSON.parse(presentationsJson) as Presentation[];
    } catch (error) {
        openPopup({ text: `Could not open meta-file! \n ${error}`, heading: "Error" });
    }

    for (const presentation of presentations) {
        sectionContainer.appendChild(createPresentationName(presentation));
        for (const section of presentation.Sections) {
            const sectionElement = new SectionElement(section);
            sectionContainer.appendChild(sectionElement.element);
            selectedSectionContainer.appendChild(sectionElement.selectedElement);
            sectionElements.push(sectionElement);
        }
    }
}

read();

exportBtn.addEventListener("click", async () => {
    if (foundVariables()) {
        await ipcRenderer.invoke(
            "openWindow",
            "variables.html",
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
                modal: true,
            },
            {
                presentations,
                placeholders,
            },
        );
    }
});

loadFileBtn.addEventListener("click", async () => {
    try {
        const filePath: OpenDialogReturnValue = await ipcRenderer.invoke("openDialog", "openFile");
        if (!filePath.canceled && filePath.filePaths.length > 0) {
            const fileType = path.extname(path.basename(filePath.filePaths[0]));
            const pathOfFile = filePath.filePaths[0];
            if (fileType === ".json") {
                const presetJson = await fs.readFile(pathOfFile, { encoding: "utf-8" });
                loadedPreset = JSON.parse(presetJson) as Preset;
                loadPreset();
            } else if (fileType === ".pptx") {
                const outPath = `${path.join(getConfig().presetPath, path.basename(pathOfFile, ".pptx"))}.TMP.json`;
                const bat = spawn(getConfig().coreApplication, ["-inPath", filePath.filePaths[0], "-outPath", outPath]);
                bat.stderr.on("data", (d) => {
                    openPopup({ text: `Error during the export:\n${d.toString()}`, heading: "Error" });
                });
                bat.on("exit", (code) => {
                    if (code !== 0) {
                        openPopup({ text: "The process exited with unknown errors!", heading: "Error" });
                    }
                    createPreset(outPath);
                });
            } else {
                openPopup({ text: "File needs to be a json or pptx:", heading: "Error" });
            }
        }
    } catch (error) {
        openPopup({ text: `Could not load file:\n${error}`, heading: "Error" });
    }
});

function loadPreset() {
    // deselect all selected slides
    for (const sectionElement of sectionElements) {
        for (const slideElement of sectionElement.slides) {
            slideElement.deselect();
        }
    }
    // delete placeholders
    placeholders = undefined;

    // go through every section
    for (const section of loadedPreset.sections) {
        // go through every included slide
        for (const slideUID of section.includedSlides) {
            for (const sectionElement of sectionElements) {
                for (const slideElement of sectionElement.slides) {
                    if (slideUID === slideElement.slide.Uid) {
                        slideElement.select();
                    }
                }
            }
        }
    }
    if (loadedPreset.placeholders.length > 0) {
        placeholders = loadedPreset.placeholders;
    }
}

function foundVariables(): boolean {
    for (const presentation of presentations) {
        for (const section of presentation.Sections) {
            for (const slide of section.Slides) {
                if (slide.IsSelected && slide.Placeholders.length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

async function createPreset(jsonPath: string) {
    const PresMetaJson = await fs.readFile(jsonPath, { encoding: "utf-8" });
    const presMeta = JSON.parse(PresMetaJson) as Presentation[];

    const preset: Preset = {
        path: jsonPath,
        sections: [],
        placeholders: [],
    };

    for (const metaP of presentations) {
        for (const metaSection of metaP.Sections) {
            const presetSection: PresetSection = {
                name: metaSection.Name,
                includedSlides: [],
                ignoredSlides: [],
            };
            for (const metaSlide of metaSection.Slides) {
                if (isSlideIncluded(metaSlide.Uid, presMeta)) {
                    presetSection.includedSlides.push(metaSlide.Uid);
                } else {
                    presetSection.ignoredSlides.push(metaSlide.Uid);
                }
            }
            if (presetSection.includedSlides.length > 0) {
                preset.sections.push(presetSection);
            }
        }
    }
    loadedPreset = preset;
    loadPreset();
    fs.rm(preset.path);
}

function isSlideIncluded(uid: string, pres: Presentation[]): boolean {
    for (const presMetaP of pres) {
        for (const presSection of presMetaP.Sections) {
            for (const presSlide of presSection.Slides) {
                if (presSlide.Uid === uid) {
                    return true;
                }
            }
        }
    }
    return false;
}
