import fsBase from "fs";
import { spawn } from "child_process";
import path, { format } from "path";
import { ipcRenderer, OpenDialogReturnValue } from "electron";

import { Presentation, Preset, PresetSection } from "../../interfaces/interfaces";
import { getConfig } from "../../config";
import SectionElement from "../components/sectionElement";
import createPresentationName from "../components/presentationName";

const fs = fsBase.promises;
const { metaJsonPath } = getConfig();

const sectionContainer = document.querySelector(".presentation-slide-container.left") as HTMLElement;
const selectedSectionContainer = document.querySelector(".presentation-slide-container.right") as HTMLElement;
const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const loadPresetBtn = document.getElementById("load-preset-btn") as HTMLButtonElement;

let presentations: Presentation[];
let loadedPreset: Preset;
const sectionElements: SectionElement[] = [];

async function read() {
    try {
        const presentationsJson = await fs.readFile(metaJsonPath, { encoding: "utf-8" });
        presentations = JSON.parse(presentationsJson) as Presentation[];
    } catch (error) {
        alert(`Fehler beim einlesen der Meta File \n ${error}`);
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

exportBtn.addEventListener("click", () => {
    const positions: number[] = [];
    for (const sectionElement of sectionElements) {
        for (const slideElement of sectionElement.selectedSlides) {
            if (slideElement.element.style.display !== "none") {
                positions.push(slideElement.slide.Position);
            }
        }
    }

    const bat = spawn(getConfig().coreApplication, [
        "-mode",
        "create",
        "-inPath",
        getConfig().presentationMasters[0].paths[0],
        "-outPath",
        path.join(getConfig().defaultExportPath, "test.pptx"),
        "-slidePos",
        positions.join(","),
        "-basePath",
        getConfig().basePath,
        "-deleteFirstSlide",
    ]);

    bat.stdout.on("data", (data) => {
        console.log(data.toString());
    });

    bat.stderr.on("data", (data) => {
        console.error(data.toString());
    });

    bat.on("exit", (code) => {
        console.log(`Child exited with code ${code}`);
    });
});

loadPresetBtn.addEventListener("click", async () => {
    try {
        const filePath: OpenDialogReturnValue = await ipcRenderer.invoke("openDialog", "openFile");
        if (!filePath.canceled && filePath.filePaths.length > 0) {
            const presetJson = await fs.readFile(filePath.filePaths[0], { encoding: "utf-8" });
            loadedPreset = JSON.parse(presetJson) as Preset;
            loadPreset();
        }
    } catch (error) {
        console.log(error);
    }
});

function loadPreset() {
    // deselect all selected slides
    for (const sectionElement of sectionElements) {
        for (const slideElement of sectionElement.slides) {
            slideElement.deselect();
        }
    }

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
}
