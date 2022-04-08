import SlideElement from "./slideElement";
import { Slide } from "../../interfaces/presentation";
import { SlideWithPath } from "../../interfaces/container";

/**
 * This class is used to display and add functionality to the selected slides.
 */
export default class SelectedSlideElement extends SlideElement {
    private slideWithPath: SlideWithPath;

    constructor(
        slide: Slide,
        presentationPath: string,
        selectedSlideWithPath: SlideWithPath[],
        slideElement: SlideElement,
        imgSrc?: string,
    ) {
        super(slide, imgSrc);
        this.slideWithPath = { slide, path: presentationPath };

        slideElement.element.addEventListener("selected", () => {
            selectedSlideWithPath.push(this.slideWithPath);
            this.element.style.order = selectedSlideWithPath.length.toString();
            this.element.style.display = "";
            console.log("this.element", this.element);
        });
        slideElement.element.addEventListener("deselected", () => {
            const index = selectedSlideWithPath.indexOf(this.slideWithPath);
            console.log("index", index);
            if (index > -1) {
                selectedSlideWithPath.splice(index, 1);
            }

            this.element.style.display = "none";
        });
    }

    protected addClickListener() {
        this.element.style.display = "none";
    }
}
