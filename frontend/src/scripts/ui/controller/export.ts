import { ipcRenderer } from "electron";
import { spawn } from "child_process";

import { getConfig } from "../../config";

const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const nameInput = document.getElementById("name-input") as HTMLInputElement;
const pathInput = document.getElementById("path-input") as HTMLInputElement;
const savePresetToggleBtn = document.getElementById("save-preset-toggle-btn") as HTMLInputElement;
const presetPathSection = document.getElementById("preset-path") as HTMLDivElement;
const presetPathInput = document.getElementById("preset-path-input") as HTMLInputElement;

let data: any;

ipcRenderer.on("data", (event, d) => {
    data = d;
});

savePresetToggleBtn.addEventListener("change", () => {
    presetPathSection.style.display = savePresetToggleBtn.checked ? "" : "none";
});

exportBtn.addEventListener("click", () => {
    exportToPptx();
});

cancelBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});

function exportToPptx() {
    const bat = spawn(getConfig().coreApplication, data);

    bat.stdout.on("data", (d) => {
        console.log(d.toString());
    });

    bat.stderr.on("data", (d) => {
        console.error(d.toString());
    });

    bat.on("exit", (code) => {
        console.log(`Child exited with code ${code}`);
    });
}
