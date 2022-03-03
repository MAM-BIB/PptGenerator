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
    sectionElement.classList.add("section");

    const header = document.createElement("h2");
    sectionElement.append(header);
    header.textContent = `${section.Name} (${section.Slides.length})`;
    header.title = `show/hide slides of ${section.Name}`;
    header.addEventListener("click", () => {
        sectionElement.classList.toggle("open");
    });

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
