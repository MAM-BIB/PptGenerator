import { Section } from "../../interfaces/interfaces";
import createSlide from "./slide";

export default function createSection(section: Section): HTMLElement {
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
