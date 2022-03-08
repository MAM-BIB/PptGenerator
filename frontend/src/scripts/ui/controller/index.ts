import fsBase from "fs";
import { spawn } from "child_process";
import path from "path";

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

exportBtn.addEventListener("click", () => {
    const positions: number[] = [];
    for (const sectionElement of sectionElements) {
        for (const slideElement of sectionElement.selectedSlides) {
            if (slideElement.element.style.display !== "none") {
                positions.push(slideElement.slide.Position);
            }
        }
    }

    console.log("paths");
    console.log(getConfig().defaultExportPath);
    console.log(path.join(getConfig().defaultExportPath, "test.pptx"));

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
