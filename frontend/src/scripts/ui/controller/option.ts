import { ipcRenderer, OpenDialogReturnValue } from "electron";
import fs from "fs";

import { getConfig, setConfig } from "../../config";
import openPopup from "../../helper";
import { addAllBrowseHandler, addBrowseHandler } from "../components/browseButton";

const config = getConfig();
const cancelBtn = document.querySelector(".cancel-btn") as HTMLButtonElement;
const saveBtn = document.querySelector(".save-btn") as HTMLButtonElement;
const defaultExport = document.getElementById("default-export") as HTMLInputElement;
const metaJson = document.getElementById("meta-json") as HTMLInputElement;
const metaPics = document.getElementById("meta-pics") as HTMLInputElement;
const hiddenSlide = document.getElementById("ignore-hidden-slides-toggle-btn") as HTMLInputElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const newPresentationSection = document.getElementById("presentation-section") as HTMLDivElement;
const selectLanguage = document.getElementById("language-select") as HTMLSelectElement;

const inputPresentation = fillInput();
addAllBrowseHandler();

for (const master of config.presentationMasters) {
    const newoption = document.createElement("option");
    newoption.textContent = master.lang;
    selectLanguage.appendChild(newoption);
}

selectLanguage.addEventListener("change", () => {
    newPresentationSection.innerHTML = "";
    if (selectLanguage.selectedIndex - 1 < 0 || selectLanguage.selectedIndex - 1 >= config.presentationMasters.length) {
        addBtn.disabled = true;
        return;
    }
    newGroupOfPresentation(selectLanguage.selectedIndex - 1);
    addBtn.disabled = false;
});

addBtn.addEventListener("click", (e) => {
    if (selectLanguage.selectedIndex - 1 < 0 || selectLanguage.selectedIndex - 1 >= config.presentationMasters.length) {
        return;
    }
    const masterIndex = selectLanguage.selectedIndex - 1;
    const pathIndex = config.presentationMasters[masterIndex].paths.length;
    config.presentationMasters[masterIndex].paths.push("");
    newPresentation(masterIndex, pathIndex);
});

saveBtn.addEventListener("click", (e) => {
    if (!saveBtn.disabled) {
        for (let masterIndex = 0; masterIndex < config.presentationMasters.length; masterIndex++) {
            const pahts = config.presentationMasters[masterIndex].paths;
            for (let pathIndex = 0; pathIndex < pahts.length; pathIndex++) {
                const pathString = pahts[pathIndex];
                if (pathString.trim() === "") {
                    config.presentationMasters[masterIndex].paths.splice(pathIndex, 1);
                    pathIndex--;
                } else if (!fs.existsSync(pathString)) {
                    openPopup({ text: `"${pathString}" does not exist!`, heading: "Error" });
                    selectLanguage.dispatchEvent(new Event("change"));
                    return;
                }
            }
        }
        setConfig(config);
        ipcRenderer.invoke("closeFocusedWindow");
    }
});

// Send a message to the main-process if the cancel-button is clicked.
cancelBtn.addEventListener("click", () => {
    if (!saveBtn.disabled) {
        // Alert willst du wirklich diese Einstellungen löschen
    }
    ipcRenderer.invoke("closeFocusedWindow");
});

function fillInput() {
    defaultExport.value = config.defaultExportPath;
    metaJson.value = config.metaJsonPath;
    metaPics.value = config.metaPicsPath;
    hiddenSlide.checked = config.ignoreHiddenSlides;
}

defaultExport.addEventListener("change", () => {
    config.defaultExportPath = defaultExport.value;
    saveBtn.disabled = false;
});

metaJson.addEventListener("change", () => {
    config.metaJsonPath = metaJson.value;
    saveBtn.disabled = false;
});

metaPics.addEventListener("change", () => {
    config.metaPicsPath = metaPics.value;
    saveBtn.disabled = false;
});

hiddenSlide.addEventListener("change", () => {
    config.ignoreHiddenSlides = hiddenSlide.checked;
    saveBtn.disabled = false;
});

hiddenSlide.addEventListener("change", () => {
    config.ignoreHiddenSlides = hiddenSlide.checked;
    saveBtn.disabled = false;
});

function newPresentation(masterIndex: number, pathIndex: number) {
    const newdiv = document.createElement("div");
    newdiv.className = "section presentation";

    const newInput = document.createElement("input");
    newInput.className = "input-path";
    newInput.type = "text";
    newInput.value = config.presentationMasters[masterIndex].paths[pathIndex];
    newInput.addEventListener("change", () => {
        config.presentationMasters[masterIndex].paths[pathIndex] = newInput.value;
        saveBtn.disabled = false;
    });

    const newDeleteBtn = document.createElement("button");
    newDeleteBtn.textContent = "X";
    newDeleteBtn.className = "delete-btn";
    newDeleteBtn.addEventListener("click", () => {
        console.log(config.presentationMasters);
        console.log(pathIndex);
        console.log(masterIndex);

        config.presentationMasters[masterIndex].paths[pathIndex] = "";
        console.log(config.presentationMasters[masterIndex].paths[pathIndex]);
        newdiv.remove();
        saveBtn.disabled = false;
    });

    const newBrowseBtn = document.createElement("button");
    newBrowseBtn.textContent = "...";
    newBrowseBtn.className = "browse-btn";

    addBrowseHandler(newBrowseBtn);

    newdiv.appendChild(newDeleteBtn);
    newdiv.appendChild(newInput);
    newdiv.appendChild(newBrowseBtn);

    newPresentationSection.appendChild(newdiv);
}

function newGroupOfPresentation(masterIndex: number) {
    const presentationMaster = config.presentationMasters[masterIndex];
    for (let pathIndex = 0; pathIndex < presentationMaster.paths.length; pathIndex++) {
        newPresentation(masterIndex, pathIndex);
    }
}
