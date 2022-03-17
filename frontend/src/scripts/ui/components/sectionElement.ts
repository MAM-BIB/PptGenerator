import { Section } from "../../interfaces/interfaces";

import SlideElement from "./slideElement";
import SelectedSlideElement from "./selectedSlideElement";
import { getConfig } from "../../config";
import isShiftPressed from "../keyHandler";

enum SectionType {
    "normal",
    "selected",
}
export default class SectionElement {
    public element: HTMLDivElement;
    public section: Section;
    public slides: SlideElement[];
    public selectedSlides: SlideElement[];

    public lastSelectedIndex = -1;
    public isSelected = false;

    public selectedElement: HTMLDivElement;
    public selectedElementHeader: HTMLHeadingElement;

    constructor(section: Section) {
        this.element = document.createElement("div") as HTMLDivElement;
        this.selectedElement = document.createElement("div") as HTMLDivElement;
        this.section = section;
        this.slides = [];
        this.selectedSlides = [];
        this.createSection(this.element, SectionType.normal);
        this.createSection(this.selectedElement, SectionType.selected);
        this.selectedElementHeader = this.selectedElement.getElementsByClassName("headerText")[0] as HTMLHeadingElement;

        this.selectedElement.hidden = true;
    }

    private createSection(element: HTMLDivElement, sectionType: SectionType = SectionType.normal) {
        const header = document.createElement("div");
        const headerText = document.createElement("h2");

        element.classList.add("section");
        headerText.classList.add("headerText");
        header.classList.add("sectionHeader");

        const nrOfSlides = this.section.Slides.length;

        headerText.textContent = `${this.section.Name} (${nrOfSlides})`;

        header.appendChild(headerText);
        element.appendChild(header);

        if (nrOfSlides !== 0) {
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("sectionButtons");

            buttonContainer.appendChild(this.createCollapseBtn(element));

            if (sectionType === SectionType.normal) {
                buttonContainer.appendChild(this.createSelectBtn(element));
            }

            header.appendChild(buttonContainer);

            for (let index = 0; index < this.section.Slides.length; index++) {
                const slide = this.section.Slides[index];

                let newSlide;
                if (sectionType === SectionType.normal) {
                    newSlide = new SlideElement(slide);

                    newSlide.element.addEventListener("selected", (event) => {
                        this.multiSelect(true, event);
                        this.handleSelectionChange();
                    });
                    newSlide.element.addEventListener("deselected", (event) => {
                        this.multiSelect(false, event);
                        this.handleSelectionChange();
                    });
                    this.slides.push(newSlide);
                } else {
                    newSlide = new SelectedSlideElement(slide, this.slides[index]);
                    this.selectedSlides.push(newSlide);
                }
                element.appendChild(newSlide.element);
            }
        }
    }

    private multiSelect(select: boolean, event: Event) {
        const curSelectedIndex = Array.prototype.indexOf.call(this.element.children, event.target) - 1;
        if (isShiftPressed()) {
            let startIndex = this.lastSelectedIndex;
            let endIndex = curSelectedIndex;
            if (endIndex < startIndex) {
                startIndex = curSelectedIndex;
                endIndex = this.lastSelectedIndex + 1;
            }

            if (this.lastSelectedIndex >= 0) {
                for (let i = startIndex; i < endIndex; i++) {
                    const slideElement = this.slides[i];
                    if (select) {
                        slideElement.select();
                    } else {
                        slideElement.deselect();
                    }
                }
            }
        }
        this.lastSelectedIndex = curSelectedIndex;
    }

    private handleSelectionChange() {
        const nr = this.slides.filter((elem) => elem.slide.IsSelected).length;

        if (nr > 0) {
            this.selectedElementHeader.textContent = `${this.section.Name} (${nr}/${this.section.Slides.length})`;

            if (!this.isSelected) {
                this.isSelected = true;
                this.element.classList.add("selected");
                this.selectedElement.hidden = false;
                this.element.dispatchEvent(new Event("selectionChanged"));
            }
        } else if (this.isSelected && nr === 0) {
            this.isSelected = false;
            this.element.classList.remove("selected");
            this.selectedElement.hidden = true;
            this.element.dispatchEvent(new Event("selectionChanged"));
        }
    }

    private createCollapseBtn(element: HTMLDivElement): HTMLButtonElement {
        const buttonCollapse = document.createElement("button");

        const spanPlus = document.createElement("span");
        spanPlus.textContent = "▼";
        spanPlus.classList.add("primary");
        buttonCollapse.appendChild(spanPlus);

        const spanMinus = document.createElement("span");
        spanMinus.textContent = "▲";
        spanMinus.classList.add("secondary");
        buttonCollapse.appendChild(spanMinus);

        buttonCollapse.title = `show/hide slides of ${this.section.Name}`;
        buttonCollapse.classList.add("collapseSection");
        buttonCollapse.addEventListener("click", () => {
            element.classList.toggle("open");
        });
        return buttonCollapse;
    }

    private createSelectBtn(element: HTMLDivElement): HTMLButtonElement {
        const buttonSelect = document.createElement("button");

        const spanPlus = document.createElement("span");
        spanPlus.className = "primary plus";
        buttonSelect.appendChild(spanPlus);

        const spanMinus = document.createElement("span");
        spanMinus.className = "secondary minus";
        buttonSelect.appendChild(spanMinus);

        buttonSelect.title = `select all slides of ${this.section.Name}`;
        buttonSelect.classList.add("selectSection");
        buttonSelect.addEventListener("click", () => {
            const { ignoreHiddenSlides } = getConfig();
            const slidesAreSelected = this.slides.some((elem) => elem.slide.IsSelected);

            for (const slide of this.slides) {
                if (slidesAreSelected) {
                    slide.deselect();
                } else if (!ignoreHiddenSlides || (ignoreHiddenSlides && !slide.slide.IsHidden)) {
                    slide.select();
                }
            }
            // Opens the section if selection is changed
            // element.classList.add("open");
        });
        return buttonSelect;
    }
}
