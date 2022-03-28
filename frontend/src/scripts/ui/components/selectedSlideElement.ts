import SlideElement from "./slideElement";
import { Slide } from "../../interfaces/interfaces";

/**
 * This class is used to display and add functionality to the selected slides.
 */
export default class SelectedSlideElement extends SlideElement {
    constructor(slide: Slide, slideElement: SlideElement) {
        super(slide);
        slideElement.element.addEventListener("selected", () => {
            this.element.style.display = "";
        });
        slideElement.element.addEventListener("deselected", () => {
            this.element.style.display = "none";
        });
    }

    protected addClickListener() {
        this.element.style.display = "none";
    }
}
