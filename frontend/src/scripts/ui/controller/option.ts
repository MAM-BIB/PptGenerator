import { ipcRenderer, OpenDialogReturnValue } from "electron";
import { getConfig, setConfig } from "../../config";

const config = getConfig();
const cancelBtn = document.querySelector(".cancel-btn") as HTMLButtonElement;
const saveBtn = document.querySelector(".save-btn") as HTMLButtonElement;
const defaultExport = document.getElementById("default-export") as HTMLInputElement;
const metaJson = document.getElementById("meta-json") as HTMLInputElement;
const metaPics = document.getElementById("meta-pics") as HTMLInputElement;
const hiddenSlide = document.getElementById("ignore-hidden-slides-toggle-btn") as HTMLInputElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;

fillInput();

addBtn.addEventListener("click", (e) => {
    if (!saveBtn.disabled) {
        setConfig(config);
    }
});

saveBtn.addEventListener("click", (e) => {
    if (!saveBtn.disabled) {
        setConfig(config);
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

for (const button of document.getElementsByClassName("browse-btn directory")) {
    button.addEventListener("click", async () => {
        try {
            const directoryPath: OpenDialogReturnValue = await ipcRenderer.invoke("openDialog", {
                properties: ["openDirectory"],
            });
            if (!directoryPath.canceled && directoryPath.filePaths.length > 0) {
                const input = button.parentElement?.getElementsByTagName("input")[0] as HTMLInputElement;
                [input.value] = directoryPath.filePaths;
            }
        } catch (error) {
            console.log(error);
        }
    });
}

for (const button of document.getElementsByClassName("browse-btn file")) {
    button.addEventListener("click", async () => {
        try {
            const filePath: OpenDialogReturnValue = await ipcRenderer.invoke("openDialog", {
                properties: ["openFile"],
            });
            if (!filePath.canceled && filePath.filePaths.length > 0) {
                const input = button.parentElement?.getElementsByTagName("input")[0] as HTMLInputElement;
                [input.value] = filePath.filePaths;
            }
        } catch (error) {
            console.log(error);
        }
    });
}
