import { ipcRenderer } from "electron";
import fs from "fs";

import { getConfig, setConfig } from "../../config";
import openPopup from "../../helper/popup";
import { addAllBrowseHandler, addBrowseHandler } from "../components/browseButton";
import initTitlebar from "../components/titlebar";

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
const addLanguageBtn = document.getElementById("add-language-btn") as HTMLButtonElement;
const languageInput = document.getElementById("language-input") as HTMLInputElement;
const deleteLanguageBtn = document.getElementById("x-btn") as HTMLButtonElement;

initTitlebar({
    resizable: false,
    menuHidden: true,
    title: "PptGenerator-Options",
});
fillInput();
addAllBrowseHandler();
fillSelect();

deleteLanguageBtn.addEventListener("click", () => {
    deleteLanguage();
});

languageInput.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") {
        addlanguage();
    }
});

addLanguageBtn.addEventListener("click", () => {
    addlanguage();
});

function addlanguage() {
    if (!languageInput.classList.contains("show")) {
        languageInput.classList.add("show");
        languageInput.focus();
        return;
    }
    if (languageInput.value.trim() === "" || languageInput.value.length < 2) {
        openPopup({
            text: "It must contain a length of at least 2 characters! ",
            heading: "Error",
        });
        return;
    }
    if (languageInput.value.length > 5) {
        openPopup({
            text: "It may only contain a maximum length of 5 characters! ",
            heading: "Error",
        });
        return;
    }
    config.presentationMasters.push({
        lang: languageInput.value,
        paths: [],
    });
    fillSelect(config.presentationMasters.length - 1);
    languageInput.classList.remove("show");
    languageInput.value = "";
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

addBtn.addEventListener("click", () => {
    if (selectLanguage.selectedIndex - 1 < 0 || selectLanguage.selectedIndex - 1 >= config.presentationMasters.length) {
        return;
    }
    const masterIndex = selectLanguage.selectedIndex - 1;
    const pathIndex = config.presentationMasters[masterIndex].paths.length;
    config.presentationMasters[masterIndex].paths.push("");
    newPresentation(masterIndex, pathIndex);
});

saveBtn.addEventListener("click", () => {
    if (!saveBtn.disabled) {
        for (let masterIndex = 0; masterIndex < config.presentationMasters.length; masterIndex++) {
            const masterPath = config.presentationMasters[masterIndex].paths;
            for (let pathIndex = 0; pathIndex < masterPath.length; pathIndex++) {
                const pathString = masterPath[pathIndex];
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
        ipcRenderer.invoke("saveOptions");
    }
});

// Send a message to the main-process if the cancel-button is clicked.
cancelBtn.addEventListener("click", async () => {
    if (!saveBtn.disabled) {
        // Alert willst du wirklich diese Einstellungen löschen
        const answer = await openPopup({
            text: "There are unsaved changes, do you really want to quit?",
            heading: "Cancel",
            primaryButton: "Yes",
            secondaryButton: "Abort",
            answer: true,
        });
        if (answer) {
            ipcRenderer.invoke("closeFocusedWindow");
        }
    } else {
        ipcRenderer.invoke("closeFocusedWindow");
    }
});

function fillInput() {
    defaultExport.value = config.defaultExportPath;
    metaJson.value = config.metaJsonPath;
    metaPics.value = config.metaPicsPath;
    hiddenSlide.checked = !config.ignoreHiddenSlides;
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
    config.ignoreHiddenSlides = !hiddenSlide.checked;
    saveBtn.disabled = false;
});

hiddenSlide.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") {
        hiddenSlide.checked = !hiddenSlide.checked;
        config.ignoreHiddenSlides = !hiddenSlide.checked;
        saveBtn.disabled = false;
    }
});

function newPresentation(masterIndex: number, pathIndex: number) {
    const newDiv = document.createElement("div");
    newDiv.className = "section presentation";

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
        config.presentationMasters[masterIndex].paths[pathIndex] = "";
        newDiv.remove();
        saveBtn.disabled = false;
    });

    const newBrowseBtn = document.createElement("button");
    newBrowseBtn.textContent = "...";
    newBrowseBtn.className = "browse-btn";

    addBrowseHandler(newBrowseBtn);

    newDiv.appendChild(newDeleteBtn);
    newDiv.appendChild(newInput);
    newDiv.appendChild(newBrowseBtn);

    newPresentationSection.appendChild(newDiv);
}

function newGroupOfPresentation(masterIndex: number) {
    const presentationMaster = config.presentationMasters[masterIndex];
    for (let pathIndex = 0; pathIndex < presentationMaster.paths.length; pathIndex++) {
        newPresentation(masterIndex, pathIndex);
    }
}

function fillSelect(lastIndex?: number) {
    selectLanguage.innerHTML = "";
    selectLanguage.append(document.createElement("option"));
    for (let index = 0; index < config.presentationMasters.length; index++) {
        const master = config.presentationMasters[index];
        const newOption = document.createElement("option");
        if (index === lastIndex) {
            newOption.selected = true;
        }
        newOption.textContent = master.lang;
        selectLanguage.appendChild(newOption);
    }
    selectLanguage.dispatchEvent(new Event("change"));
}

function deleteLanguage() {
    for (const master of config.presentationMasters) {
        if (master.lang === selectLanguage.options[selectLanguage.selectedIndex].value) {
            config.presentationMasters.splice(selectLanguage.selectedIndex - 1, 1);
            fillSelect();
            saveBtn.disabled = false;
            return;
        }
    }
}