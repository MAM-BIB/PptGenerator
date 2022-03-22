import fsBase from "fs";
import path from "path";
import { ipcRenderer, OpenDialogReturnValue } from "electron";

import { Presentation, Placeholder } from "../../interfaces/interfaces";
import { getConfig, setConfig } from "../../config";
import SectionElement from "../components/sectionElement";
import createPresentationName from "../components/presentationName";
import initTitlebar from "../components/titlebar";
import openPopup from "../../helper/popup";
import { startLoading, stopLoading } from "../components/loading";
import LoadFile from "../../helper/loadFile";

const fs = fsBase.promises;

const sectionContainer = document.querySelector(".presentation-slide-container.left") as HTMLElement;
const selectedSectionContainer = document.querySelector(".presentation-slide-container.right") as HTMLElement;
const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const presentationMasterSelect = document.getElementById("presentation-master-select") as HTMLSelectElement;
const loadFileBtn = document.getElementById("load-preset-btn") as HTMLButtonElement;

let presentations: Presentation[];
let placeholders: Placeholder[] | undefined;

let presentationMasterLang: string;
let sectionElements: SectionElement[];

initTitlebar();
fillPresentationMasterSelect();
read();
showTutorial();

async function showTutorial() {
    if (getConfig().showTutorial) {
        const config = getConfig();
        config.showTutorial = false;
        setConfig(config);
        await ipcRenderer.invoke("openWindow", "help.html", {
            width: 800,
            height: 600,
            minWidth: 500,
            minHeight: 400,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            autoHideMenuBar: true,
            modal: false,
        });
    }
}

ipcRenderer.on("startLoading", () => {
    startLoading();
});

function fillPresentationMasterSelect() {
    presentationMasterSelect.innerHTML = "";
    for (const lang of getConfig().presentationMasters.map((elem) => elem.lang)) {
        const optionElem = document.createElement("option");
        optionElem.textContent = lang;
        presentationMasterSelect.append(optionElem);
    }
    presentationMasterLang = presentationMasterSelect.value;
    presentationMasterSelect.addEventListener("change", () => {
        presentationMasterLang = presentationMasterSelect.value;
        loadSections();
    });
}

async function read() {
    try {
        const presentationsJson = await fs.readFile(getConfig().metaJsonPath, { encoding: "utf-8" });
        presentations = JSON.parse(presentationsJson) as Presentation[];
    } catch (error) {
        await openPopup({ text: `Could not open meta-file! \n ${error}`, heading: "Error", answer: true });
    }

    loadSections();
}

function loadSections() {
    if (getConfig().presentationMasters.length === 0) return;

    const selectedPresentationMaster = getConfig().presentationMasters.find(
        (elem) => elem.lang === presentationMasterLang,
    );

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
                sectionElement.element.addEventListener("selectionChanged", () => {
                    handleSelectionChange();
                });
                sectionElements.push(sectionElement);
            }
        }
    }
}

function handleSelectionChange() {
    exportBtn.disabled = !sectionElements.some((elem) => elem.isSelected);
}

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
    } else {
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
                placeholders,
            },
        );
    }
});

loadFileBtn.addEventListener("click", async () => {
    try {
        const filePath: OpenDialogReturnValue = await ipcRenderer.invoke("openDialog", "openFile");
        if (!filePath.canceled && filePath.filePaths.length > 0) {
            startLoading();
            const fileType = path.extname(path.basename(filePath.filePaths[0]));

            if (fileType === ".json" || fileType === ".pptx") {
                const file: LoadFile = new LoadFile(sectionElements);
                await file.load(filePath, fileType);
                placeholders = file.placeholders;
            } else {
                openPopup({ text: "File needs to be a .json or .pptx", heading: "Error" });
            }
        }
    } catch (error) {
        openPopup({ text: `Could not load file:\n${error}`, heading: "Error" });
    }
    stopLoading();
});

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
