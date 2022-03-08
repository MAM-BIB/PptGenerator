import { Slide } from "../../interfaces/interfaces";

export default class SlideElement {
    public selected: boolean;
    public slide: Slide;
    public element: HTMLDivElement;

    constructor(slide: Slide) {
        this.element = document.createElement("div") as HTMLDivElement;
        this.selected = false;
        this.slide = slide;
        this.createSlide();
    }

    public select(): boolean {
        if (this.selected) {
            return false;
        }

        this.selected = true;
        this.element.classList.add("selected");
        this.element.dispatchEvent(new Event("selected"));
        return true;
    }

    public deselect(): boolean {
        if (!this.selected) {
            return false;
        }

        this.selected = false;
        this.element.classList.remove("selected");
        this.element.dispatchEvent(new Event("deselected"));
        return true;
    }

    public toggleSelection() {
        this.selected = !this.selected;
        if (this.selected) {
            this.element.classList.add("selected");
            this.element.dispatchEvent(new Event("selected"));
        } else {
            this.element.classList.remove("selected");
            this.element.dispatchEvent(new Event("deselected"));
        }
    }

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

    protected addClickListener() {
        this.element.tabIndex = 0;
        this.element.addEventListener("click", () => {
            this.toggleSelection();
        });
        this.element.addEventListener("keydown", (e) => {
            console.log("onkeydown", (e as KeyboardEvent).key);

            if ((e as KeyboardEvent).key === "Enter") {
                this.toggleSelection();
            }
        });
    }
}
