import { Slide } from "../../interfaces/interfaces";

export default function createSlide(slide: Slide): HTMLElement {
    const slideElement = document.createElement("div");
    slideElement.classList.add("slide");
    slideElement.textContent = `UID:${slide.Uid}`;
    slideElement.title = `slide:
        UID:${slide.Uid},
        pos:${slide.Position},
        rlid:${slide.RelationshipId},
        isHidden:${slide.IsHidden}`;
    return slideElement;
}
