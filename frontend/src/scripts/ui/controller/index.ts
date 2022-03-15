import fsBase from "fs";
import { ipcRenderer, OpenDialogReturnValue } from "electron";
import path from "path";

import { Presentation, Preset } from "../../interfaces/interfaces";
import { getConfig } from "../../config";
import SectionElement from "../components/sectionElement";
import createPresentationName from "../components/presentationName";
import openPopup from "../../helper";

const fs = fsBase.promises;
const { metaJsonPath, presentationMasters } = getConfig();

const sectionContainer = document.querySelector(".presentation-slide-container.left") as HTMLElement;
const selectedSectionContainer = document.querySelector(".presentation-slide-container.right") as HTMLElement;
const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const loadPresetBtn = document.getElementById("load-preset-btn") as HTMLButtonElement;
const presentationMasterSelect = document.getElementById("presentation-master-select") as HTMLSelectElement;

let presentations: Presentation[];
let loadedPreset: Preset;

let presentationMasterLang = "de";
let sectionElements: SectionElement[] = [];

fillPresentationMasterSelect();
read();

function fillPresentationMasterSelect() {
    presentationMasterSelect.innerHTML = "";
    for (const lang of presentationMasters.map((elem) => elem.lang)) {
        const optionElem = document.createElement("option");
        optionElem.textContent = lang;
        presentationMasterSelect.append(optionElem);
    }
    presentationMasterSelect.addEventListener("change", () => {
        presentationMasterLang = presentationMasterSelect.value;
        loadSections();
    });
}

async function read() {
    try {
        const presentationsJson = await fs.readFile(metaJsonPath, { encoding: "utf-8" });
        presentations = JSON.parse(presentationsJson) as Presentation[];
    } catch (error) {
        openPopup({ text: `Could not open meta-file! \n ${error}`, heading: "Error" });
    }

    loadSections();
}

function loadSections() {
    const selectedPresentationMaster = presentationMasters.find((elem) => elem.lang === presentationMasterLang);

    sectionContainer.innerHTML = "";
    selectedSectionContainer.innerHTML = "";
    sectionElements = [];

    if (!selectedPresentationMaster) {
        openPopup({ heading: "Error", text: "Could not find the selected master presentation!" });
    }
    for (const presentation of presentations) {
        if (selectedPresentationMaster?.paths.some((p) => path.normalize(p) === path.normalize(presentation.Path))) {
            sectionContainer.appendChild(createPresentationName(presentation));
            for (const section of presentation.Sections) {
                const sectionElement = new SectionElement(section);
                sectionContainer.appendChild(sectionElement.element);
                selectedSectionContainer.appendChild(sectionElement.selectedElement);
                sectionElements.push(sectionElement);
            }
        }
    }
}

exportBtn.addEventListener("click", async () => {
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
        presentations,
    );
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
        openPopup({ text: `Could not load template:\n${error}`, heading: "Error" });
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
