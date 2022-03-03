import fsBase from "fs";
import Path from "path";
import { Presentation, Section, Slide } from "./interfaces";

const fs = fsBase.promises;
const metaFilePath = Path.join(__dirname, "../../../meta/test.json");
const sectionContainer = document.querySelector(".presentation-slide-container.left") as HTMLElement;
const selectedSectionContainer = document.querySelector(".presentation-slide-container.right") as HTMLElement;

let presentations: Presentation[];

async function read() {
    try {
        const presentationsJson = await fs.readFile(metaFilePath, { encoding: "utf-8" });
        presentations = JSON.parse(presentationsJson) as Presentation[];
    } catch (error) {
        console.log("Fehler beim Einlesen");
    }

    for (const presentation of presentations) {
        for (const section of presentation.Sections) {
            sectionContainer.append(createSection(section));
        }
    }
}

function createSection(section: Section): HTMLElement {
    const sectionElement = document.createElement("div");
    const header = document.createElement("div");
    const headerText = document.createElement("h2");

    sectionElement.classList.add("section");
    headerText.classList.add("headerText");
    header.classList.add("sectionHeader");

    headerText.textContent = `${section.Name} (${section.Slides.length})`;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("sectionButtons");

    const buttonCollapse = document.createElement("button");
    buttonCollapse.textContent = "▼";
    buttonCollapse.title = `show/hide slides of ${section.Name}`;
    buttonCollapse.classList.add("collapseSection");
    buttonCollapse.addEventListener("click", () => {
        sectionElement.classList.toggle("open");
    });
    buttonContainer.append(buttonCollapse);

    const buttonSelect = document.createElement("button");
    buttonSelect.title = `select all slides of ${section.Name}`;
    buttonSelect.classList.add("selectSection");
    buttonSelect.textContent = "+";
    buttonContainer.append(buttonSelect);

    header.append(headerText);
    header.append(buttonContainer);
    sectionElement.append(header);

    for (const slide of section.Slides) {
        sectionElement.append(createSlide(slide));
    }

    return sectionElement;
}

function createSlide(slide: Slide): HTMLElement {
    const slideElement = document.createElement("div");
    slideElement.classList.add("slide");
    slideElement.textContent = `UID:${slide.Uid}`;
    slideElement.title = `slide:
        UID:${slide.Uid},
        pos:${slide.Position},
        rlid:${slide.RelationshipId},
        isHidden:${slide.IsHidden}`;
    return slideElement;
}

read();
