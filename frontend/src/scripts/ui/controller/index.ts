import fsBase from "fs";

import { Presentation } from "../../interfaces/interfaces";
import getConfig from "../../config";
import HTMLSectionElement from "../components/section";
import createPresentationName from "../components/presentationName";

const fs = fsBase.promises;
const metaFilePath = getConfig().metaJsonPath;
const sectionContainer = document.querySelector(".presentation-slide-container.left") as HTMLElement;
// const selectedSectionContainer = document.querySelector(".presentation-slide-container.right") as HTMLElement;

let presentations: Presentation[];

async function read() {
    try {
        const presentationsJson = await fs.readFile(metaFilePath, { encoding: "utf-8" });
        presentations = JSON.parse(presentationsJson) as Presentation[];
    } catch (error) {
        alert(`Fehler beim einlesen der Meta File \n ${error}`);
    }

    for (const presentation of presentations) {
        sectionContainer.append(createPresentationName(presentation));
        for (const section of presentation.Sections) {
            sectionContainer.append(new HTMLSectionElement(section).element);
        }
    }
}

read();
