import path from "path";

import { Presentation } from "../../interfaces/interfaces";

/**
 * This function ist used to create an HtmlElement witch the name of a presentation to display the name
 * in the GUI.
 * @param presentation The presentation from which the name will be taken.
 * @returns A HtmlElement that contains the name of the presentation.
 */
export default function createPresentationName(presentation: Presentation): HTMLElement {
    const presNameContainer = document.createElement("div");
    presNameContainer.classList.add("presNameContainer");

    const presName = path.basename(presentation.Path);
    const nameText = document.createElement("h2");
    nameText.classList.add("presentationName");
    nameText.textContent = presName;
    presNameContainer.append(nameText);

    const hr = document.createElement("hr");
    hr.classList.add("nameUnderline");
    presNameContainer.append(hr);

    return presNameContainer;
}
