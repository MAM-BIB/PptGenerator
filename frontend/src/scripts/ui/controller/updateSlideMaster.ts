import { ipcRenderer } from "electron";

import initTitlebar from "../components/titlebar";
import { SlideWithPathAndImg } from "../../interfaces/container";

const selectionContainer = document.getElementById("uid-section");
const cancelButton = document.getElementById("cancel-btn");
const updateButton = document.getElementById("update-btn");

let updateUids: { [uid: string]: SlideWithPathAndImg[] };
let newSlides: SlideWithPathAndImg[];

// Initialization of the custom titlebar.
initTitlebar({
    resizable: false,
    menuHidden: true,
    title: "PptGenerator-Update",
});

/**
 * This will be called when the window opens
 */
ipcRenderer.on("data", (event, data) => {
    updateUids = data.updateUids;
    newSlides = data.newSlides;
    loadContent();
});

/**
 * Add the event to the cancel button for the preset creation.
 */
cancelButton?.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});

/**
 * Add the event to the cancel button for the preset creation.
 */
updateButton?.addEventListener("click", () => {
    // code...
});

/**
 * This function loads creates the content for the window.
 * @param updateUids A HashMap with UIDs as key and slides as values that can be updated
 * @param newSlides A Collection of Slides with Path and ImgsPath that are not known to the PresentationMasters
 */
function loadContent() {
    // goes through the HashMap and saves all the new slides in an Array.
    for (const uid in updateUids) {
        if (Object.prototype.hasOwnProperty.call(updateUids, uid)) {
            const uidWithSlides = updateUids[uid];
            const slides: SlideWithPathAndImg[] = [];
            for (const slide of uidWithSlides) {
                if (slide !== uidWithSlides[0]) {
                    slides.push(slide);
                }
            }
            // adds the slides to the window
            selectionContainer?.appendChild(createSection(slides, uid));
        }
    }
    // checks is there are unknown slides and adds them to window.
    if (newSlides.length > 0) {
        selectionContainer?.appendChild(createNewSlideSection(newSlides));
    }
}

/**
 * This function creates a section which contains slides with imgs that. One of the slides can be selected.
 * @param uidWithSlides A Collection of the slides that are contained in a section
 * @param uid The UID for the created section.
 * @returns A HtmlDivElement.
 */
function createSection(uidWithSlides: SlideWithPathAndImg[], uid: string): HTMLDivElement {
    const section = document.createElement("div");
    section.classList.add("uid-section-element");

    section.appendChild(createUidTitleElement(uid));

    for (const slide of uidWithSlides) {
        section.appendChild(createSelectionSlideElement(uid, slide.imgPath));
    }

    return section;
}

/**
 * This function creates a div element which contains a UID as a header and an hr.
 * @param uid The UID that will be used as the Title.
 * @returns A HtmlDivElement.
 */
function createUidTitleElement(uid: string): HTMLDivElement {
    const uidContainer = document.createElement("div");
    uidContainer.classList.add("uid-title-container");

    const uidTitle = document.createElement("h2");
    uidTitle.textContent = `UID: ${uid}`;
    uidContainer.appendChild(uidTitle);

    const line = document.createElement("hr");
    uidContainer.appendChild(line);

    return uidContainer;
}

/**
 * This function creates a Label that contains a img and a radio Button so you can select it.
 * @param uid The UID to group the labels.
 * @param imgPath The path to the img source.
 * @returns A HtmlLabel that can be selected like a radio Button.
 */
function createSelectionSlideElement(uid: string, imgPath: string): HTMLLabelElement {
    const slideLabel = document.createElement("label");
    slideLabel.classList.add("selection-slide");

    const slideImg = document.createElement("img");
    slideImg.src = imgPath;
    slideLabel.appendChild(slideImg);

    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = uid;
    slideLabel.appendChild(radioInput);

    return slideLabel;
}

/**
 * This function creates a section which contains all slides that are unknown to the PresentationMaster
 * @param slides The slides that will be in this section
 * @returns A HtmlDivElement
 */
function createNewSlideSection(slides: SlideWithPathAndImg[]): HTMLDivElement {
    const section = document.createElement("div");
    section.classList.add("new-slide-section");

    const title = document.createElement("h2");
    title.textContent = "New Slides:";
    section.appendChild(title);

    const line = document.createElement("hr");
    section.appendChild(line);

    for (const slide of slides) {
        const slideLabel = createNewSlideSelection(slide.imgPath);
        slideLabel.classList.add("new-slide");
        section.appendChild(slideLabel);
    }

    return section;
}

/**
 * This function creates a Label that contains a img and a checkbox so you can select it.
 * @param imgPath The path to the img source.
 * @returns A HtmlLabel that can be selected like a checkbox.
 */
function createNewSlideSelection(imgPath: string): HTMLLabelElement {
    const slideLabel = document.createElement("label");
    slideLabel.classList.add("new-slide-label");

    const slideImg = document.createElement("img");
    slideImg.src = imgPath;
    slideLabel.appendChild(slideImg);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    slideLabel.appendChild(checkbox);

    return slideLabel;
}
