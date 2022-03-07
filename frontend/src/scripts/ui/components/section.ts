import { Section } from "../../interfaces/interfaces";

import HTMLSlideElement from "./slide";
import getConfig from "../../config";

export default class HTMLSectionElement {
    public element: HTMLDivElement;
    public section: Section;
    public slides: HTMLSlideElement[];

    constructor(section: Section) {
        this.element = document.createElement("div") as HTMLDivElement;
        this.section = section;
        this.slides = [];
        this.createSection();
    }

    private createSection() {
        const header = document.createElement("div");
        const headerText = document.createElement("h2");

        this.element.classList.add("section");
        headerText.classList.add("headerText");
        header.classList.add("sectionHeader");

        headerText.textContent = `${this.section.Name} (${this.section.Slides.length})`;

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("sectionButtons");

        const buttonCollapse = document.createElement("button");
        buttonCollapse.textContent = "▼";
        buttonCollapse.title = `show/hide slides of ${this.section.Name}`;
        buttonCollapse.classList.add("collapseSection");
        buttonCollapse.addEventListener("click", () => {
            this.element.classList.toggle("open");
        });
        buttonContainer.append(buttonCollapse);

        const buttonSelect = document.createElement("button");
        buttonSelect.textContent = "+";
        buttonSelect.title = `select all slides of ${this.section.Name}`;
        buttonSelect.classList.add("selectSection");
        buttonSelect.addEventListener("click", () => {
            const { ignoreHiddenSlides } = getConfig();
            const slidesAreSelected = this.slides.some((elem) => elem.selected);
            if (!slidesAreSelected) {
                for (const slide of this.slides) {
                    if (!ignoreHiddenSlides || (ignoreHiddenSlides && !slide.slide.IsHidden)) {
                        slide.selected = true;
                        slide.element.classList.add("selected");
                    }
                }
            } else {
                for (const slide of this.slides) {
                    slide.selected = false;
                    slide.element.classList.remove("selected");
                }
            }
            this.element.classList.add("open");
        });
        buttonContainer.append(buttonSelect);

        header.append(headerText);
        header.append(buttonContainer);
        this.element.append(header);

        for (const slide of this.section.Slides) {
            const newSlide = new HTMLSlideElement(slide);
            this.slides.push(newSlide);
            this.element.append(newSlide.element);
        }
    }
}
