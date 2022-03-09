import fsBase from "fs";
import path from "path";
import { ipcRenderer, OpenDialogReturnValue } from "electron";

import { Presentation } from "../../interfaces/interfaces";
import getConfig from "../../config";
import SectionElement from "../components/sectionElement";
import createPresentationName from "../components/presentationName";

const fs = fsBase.promises;
const { metaJsonPath } = getConfig();

const sectionContainer = document.querySelector(".presentation-slide-container.left") as HTMLElement;
const selectedSectionContainer = document.querySelector(".presentation-slide-container.right") as HTMLElement;
const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;

let presentations: Presentation[];
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

exportBtn.addEventListener("click", async () => {
    const positions: number[] = [];
    for (const sectionElement of sectionElements) {
        for (const slideElement of sectionElement.selectedSlides) {
            if (slideElement.element.style.display !== "none") {
                positions.push(slideElement.slide.Position);
            }
        }
    }

    await ipcRenderer.invoke(
        "openWindow",
        "export.html",
        {
            width: 1000,
            height: 600,
            minWidth: 500,
            minHeight: 400,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        },
        [
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
        ],
    );
});

for (const button of document.getElementsByClassName("browse-btn")) {
    button.addEventListener("click", async () => {
        try {
            const directoryPath: OpenDialogReturnValue = await ipcRenderer.invoke("openDirectoryDialog");
            if (!directoryPath.canceled && directoryPath.filePaths.length > 0) {
                const input = button.parentElement?.getElementsByTagName("input")[0] as HTMLInputElement;
                [input.value] = directoryPath.filePaths;
            }
        } catch (error) {
            console.log(error);
        }
    });
}
