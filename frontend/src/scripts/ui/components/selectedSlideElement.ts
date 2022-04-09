import SlideElement from "./slideElement";
import { Slide } from "../../interfaces/presentation";
import { SlideWithPath } from "../../interfaces/container";

/**
 * This class is used to display and add functionality to the selected slides.
 */
export default class SelectedSlideElement extends SlideElement {
    public slideWithPath: SlideWithPath;

    constructor(
        slide: Slide,
        presentationPath: string,
        selectedSlideWithPath: SlideWithPath[],
        slideElement: SlideElement,
        imgSrc?: string,
    ) {
        super(slide, imgSrc);
        this.slideWithPath = { slide, path: presentationPath };
        this.element.draggable = true;
        this.element.classList.add("draggable");
        this.element.addEventListener("dragstart", (event) => {
            event.dataTransfer?.setData("text", this.element.style.order);
        });
        this.element.addEventListener("dragover", (event) => {
            event.preventDefault();
        });
        this.element.addEventListener("drop", (event) => {
            event.preventDefault();
            const incomingIndex = parseInt(event.dataTransfer?.getData("text") ?? "", 10);
            if (incomingIndex && incomingIndex >= 0 && incomingIndex < selectedSlideWithPath.length) {
                const ownIndex = selectedSlideWithPath.indexOf(this.slideWithPath);
                selectedSlideWithPath.splice(ownIndex, 0, selectedSlideWithPath.splice(incomingIndex, 1)[0]);

                this.element.parentElement?.dispatchEvent(new Event("orderChanged"));
            }
        });

        slideElement.element.addEventListener("selected", () => {
            selectedSlideWithPath.push(this.slideWithPath);
            this.element.style.order = (selectedSlideWithPath.length - 1).toString();
            this.element.style.display = "";
        });
        slideElement.element.addEventListener("deselected", () => {
            const index = selectedSlideWithPath.indexOf(this.slideWithPath);
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
