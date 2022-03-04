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
        this.element.textContent = `UID:${this.slide.Uid}`;
        this.element.title = `slide:
            UID:${this.slide.Uid},
            pos:${this.slide.Position},
            rlid:${this.slide.RelationshipId},
            isHidden:${this.slide.IsHidden}`;

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
