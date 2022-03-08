import { ipcRenderer } from "electron";
import getConfig from "../../config";

const config = getConfig();
const cancelBtn = document.querySelector(".cancel-btn") as HTMLButtonElement;
const defaultExport = document.getElementById("default-export") as HTMLInputElement;
const metaJson = document.getElementById("meta-json") as HTMLInputElement;
const metaPics = document.getElementById("meta-pics") as HTMLInputElement;

console.log(config.presentationMasters);

console.log(allpath());

function allpath() {
    defaultExport.value = config.defaultExportPath;
    metaJson.value = config.metaJsonPath;
    metaPics.value = config.metaPicsPath;
}

// Send a message to the main-process if the cancel-button is clicked.
cancelBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});
