import { Slide } from "../../interfaces/interfaces";

/**
 * This class is used to display and add functionality to the slides inside the sections.
 */
export default class SlideElement {
    public slide: Slide;
    public element: HTMLDivElement;

    constructor(slide: Slide) {
        this.element = document.createElement("div") as HTMLDivElement;
        this.slide = slide;
        this.slide.IsSelected = false;
        this.createSlide();
    }

    /**
     * This functions adds th selected class and calls the selected event
     * @returns A boolean if the slide is selected.
     */
    public select(): boolean {
        if (this.slide.IsSelected) {
            return false;
        }

        this.slide.IsSelected = true;
        this.element.classList.add("selected");
        this.element.dispatchEvent(new Event("selected"));
        return true;
    }

    /**
     * This function removes the class selected and calls the deselect event.
     * @returns A boolean if the slide is selected.
     */
    public deselect(): boolean {
        if (!this.slide.IsSelected) {
            return false;
        }

        this.slide.IsSelected = false;
        this.element.classList.remove("selected");
        this.element.dispatchEvent(new Event("deselected"));
        return true;
    }

    /**
     * This functions toggle the selection of a slide
     */
    public toggleSelection() {
        this.slide.IsSelected = !this.slide.IsSelected;
        if (this.slide.IsSelected) {
            this.element.classList.add("selected");
            this.element.dispatchEvent(new Event("selected"));
        } else {
            this.element.classList.remove("selected");
            this.element.dispatchEvent(new Event("deselected"));
        }
    }

    /**
     * This function creates a Slide that will be displayed in the GUI and has all functionalities
     */
    private createSlide() {
        this.element.classList.add("slide");
        if (this.slide.IsHidden) this.element.classList.add("hidden-slide");
        this.element.textContent = `${this.slide.Title === "" ? "No Title" : this.slide.Title}`;
        this.element.title = `slide:
            title: ${this.slide.Title},
            UID: ${this.slide.Uid},
            pos: ${this.slide.Position},
            rlid: ${this.slide.RelationshipId},
            isHidden: ${this.slide.IsHidden}`;

        this.addClickListener();
    }

    /**
     * Adds the functionality to click a slide
     */
    protected addClickListener() {
        this.element.tabIndex = 0;
        this.element.addEventListener("click", () => {
            this.toggleSelection();
        });
        this.element.addEventListener("keydown", (e) => {
            if ((e as KeyboardEvent).key === "Enter") {
                this.toggleSelection();
            }
        });
    }
}
