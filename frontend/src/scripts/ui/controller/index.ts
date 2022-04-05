import fsBase from "fs";
import path from "path";
import { ipcRenderer, OpenDialogReturnValue } from "electron";

import { Presentation } from "../../interfaces/presentation";
import { Placeholder } from "../../interfaces/preset";
import { getConfig, setConfig } from "../../helper/config";
import SectionElement from "../components/sectionElement";
import createPresentationName from "../components/presentationName";
import initTitlebar from "../components/titlebar";
import openPopup from "../../helper/openPopup";
import { startLoading, stopLoading } from "../components/loading";
import LoadFile from "../../helper/loadFile";
import isRunning, { killPpt } from "../../helper/processManager";

const fs = fsBase.promises;

const sectionContainer = document.querySelector(".presentation-slide-container.left") as HTMLElement;
const selectedSectionContainer = document.querySelector(".presentation-slide-container.right") as HTMLElement;
const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const presentationMasterSelect = document.getElementById("presentation-master-select") as HTMLSelectElement;
const loadFileBtn = document.getElementById("load-preset-btn") as HTMLButtonElement;

let presentations: Presentation[];
let placeholders: Placeholder[] = [];

let presentationMasterLang: string;
let sectionElements: SectionElement[];

// Initialization of the custom titlebar.
initTitlebar();
// Display the left side with presentations, section and slides
fillPresentationMasterSelect();
// Reads all data from the meta file
read();
// Shows the help window.
showTutorial();

/**
 * This function will show you the tutorial automatically if you start the program for the first time
 */
async function showTutorial() {
    if (getConfig().showTutorial) {
        const config = getConfig();
        config.showTutorial = false;
        setConfig(config);
        await ipcRenderer.invoke("openWindow", "help.html", {
            width: 900,
            height: 700,
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

// used to start the loading animation.
ipcRenderer.on("startLoading", () => {
    startLoading();
});

// used to stop the loading animation.
ipcRenderer.on("stopLoading", () => {
    stopLoading();
});

/**
 * Function to only show the Presentation date from the selected language.
 */
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

/**
 * Function to read all the data from the meta.json file.
 */
async function read() {
    try {
        const presentationsJson = await fs.readFile(getConfig().metaJsonPath, { encoding: "utf-8" });
        presentations = JSON.parse(presentationsJson) as Presentation[];
    } catch (error) {
        await openPopup({ text: `Could not open meta-file! \n ${error}`, heading: "Error", answer: true });
    }

    loadSections();
}

/**
 * This function will load all sections to display them in th GUI.
 */
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
    for (let index = 0; index < presentations.length; index++) {
        const presentation = presentations[index];
        if (selectedPresentationMaster?.paths.some((p) => path.resolve(p) === path.resolve(presentation.Path))) {
            sectionContainer.appendChild(createPresentationName(presentation));
            for (const section of presentation.Sections) {
                const sectionElement = new SectionElement(section, index.toString());
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

/**
 * This function handles the change of a selection.
 */
function handleSelectionChange() {
    exportBtn.disabled = !sectionElements.some((elem) => elem.isSelected);
}

/**
 * Adds the event to the export button.
 */
exportBtn.addEventListener("click", async () => {
    // warns if powerpoint is open
    if (isRunning("POWERPNT")) {
        const answer = await openPopup({
            text: "We detected that PowerPoint is open. Please close the process",
            heading: "Warning",
            primaryButton: "Kill PowerPoint",
            secondaryButton: "Cancel",
            answer: true,
        });
        if (answer) {
            killPpt();
        }
    } else if (foundVariables()) {
        // opens variables window if variables were found
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
                modal: true,
            },
            {
                presentations,
                placeholders,
            },
        );
    } else {
        // opens export window.
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

/**
 * Adds the event for the load file button.
 */
loadFileBtn.addEventListener("click", async () => {
    try {
        const filePath: OpenDialogReturnValue = await ipcRenderer.invoke("openDialog", "openFile");
        // checks if a file was selected
        if (!filePath.canceled && filePath.filePaths.length > 0) {
            startLoading();
            const fileType = path.extname(path.basename(filePath.filePaths[0]));
            const pathOfFile = filePath.filePaths[0];

            // check if the selected file id .json or .pptx
            if (fileType === ".json" || fileType === ".pptx") {
                const file: LoadFile = new LoadFile(sectionElements);
                await file.load(pathOfFile, fileType);
                placeholders = file.placeholders;
            } else {
                // warns if selected file has wrong type
                openPopup({ text: "File needs to be a .json or .pptx", heading: "Error" });
            }
        }
    } catch (error) {
        // waring if the file could not be loaded
        openPopup({ text: `Could not load file:\n${error}`, heading: "Error" });
    }
    stopLoading();
});

/**
 * This function checks if there are placeholder in the selected slides.
 * @returns A boolean if variables were found or not
 */
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
