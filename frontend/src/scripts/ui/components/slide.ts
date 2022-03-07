import { Slide } from "../../interfaces/interfaces";

export default class HTMLSlideElement {
    public selected: boolean;
    public slide: Slide;
    public element: HTMLDivElement;

    constructor(slide: Slide) {
        this.element = document.createElement("div") as HTMLDivElement;
        this.selected = false;
        this.slide = slide;
        this.createSlide();
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

        this.element.addEventListener("click", () => {
            this.selected = !this.selected;
            if (this.selected) {
                this.element.classList.add("selected");
            } else {
                this.element.classList.remove("selected");
            }
        });
    }
}
