import { ipcRenderer } from "electron";

import initTitlebar from "../components/titlebar";
import { SlideWithPath, SlideWithPathAndImg } from "../../interfaces/container";
import call from "../../helper/systemcall";

const selectionContainer = document.getElementById("uid-section");
const cancelButton = document.getElementById("cancel-btn");
const updateButton = document.getElementById("update-btn");
const selectedUpdateSlidesInputs: HTMLInputElement[] = [];
const selectedNewSlidesInputs: HTMLInputElement[] = [];
const selectedUpdateSlides: SlideWithPath[] = [];
const selectedNewSlides: SlideWithPath[] = [];

let updateUids: { [uid: string]: SlideWithPathAndImg[] };
let newSlides: SlideWithPathAndImg[];

// Initialization of the custom titlebar.
initTitlebar({
    resizable: true,
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
 * Add the event to the cancel button
 */
cancelButton?.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});

/**
 * Add the event to the update button
 */
updateButton?.addEventListener("click", () => {
    // -mode create -inPath "test.pptx" -outPath "test1.pptx" -slidePos "5,5,5" -replace "0,1,40"
    const updateSlides: SlideWithPath[] = [];
    const slidesNew: SlideWithPath[] = [];

    for (let index = 0; index < selectedUpdateSlidesInputs.length; index++) {
        const radioButton = selectedUpdateSlidesInputs[index];
        if (radioButton.checked) {
            updateSlides.push(selectedUpdateSlides[index]);
        }
    }
    for (let index = 0; index < selectedNewSlidesInputs.length; index++) {
        const checkbox = selectedNewSlidesInputs[index];
        if (checkbox.checked) {
            slidesNew.push(selectedNewSlides[index]);
        }
    }
    // TODO: Marc pls help!
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
            // adds the slides to the window
            selectionContainer?.appendChild(createSection(uidWithSlides, uid));
        }
    }
    // checks is there are unknown slides and adds them to window.
    if (newSlides.length > 0) {
        selectionContainer?.appendChild(createNewSlideSection(newSlides));
    }
}

/**
 * This function creates a div with a header in it
 * @param text The text that is displayed in the header
 * @returns A HtmlDivElement
 */
function createStatusTitle(text: string): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add("status-container");

    const header = document.createElement("h3");
    header.innerText = text;
    container.appendChild(header);

    return container;
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

    let counter = 0;
    for (const slide of uidWithSlides) {
        if (slide === uidWithSlides[0]) {
            section.appendChild(createStatusTitle("Original:"));
            section.appendChild(createSelectionSlideElement(uid, slide.imgPath, uid + counter, true, slide));
            section.appendChild(createStatusTitle("Versions:"));
        } else {
            section.appendChild(createSelectionSlideElement(uid, slide.imgPath, uid + counter, false, slide));
        }
        counter++;
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
 * @returns A HtmlDivElement.
 */
function createSelectionSlideElement(
    uid: string,
    imgPath: string,
    id: string,
    select: boolean,
    slideWithPath: SlideWithPath,
): HTMLDivElement {
    const div = document.createElement("div");
    div.classList.add("selection-slide");

    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = uid;
    radioInput.id = id;
    radioInput.checked = select;
    selectedUpdateSlidesInputs.push(radioInput);
    selectedUpdateSlides.push(slideWithPath);
    div.appendChild(radioInput);

    const slideLabel = document.createElement("label");

    const slideImg = document.createElement("img");
    slideImg.src = imgPath;
    slideLabel.appendChild(slideImg);
    slideLabel.htmlFor = id;
    div.appendChild(slideLabel);

    return div;
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

    let counter = 0;
    for (const slide of slides) {
        const slideLabel = createNewSlideSelection(slide.imgPath, slide.slide.Uid + counter, slide);
        slideLabel.classList.add("new-slide");
        section.appendChild(slideLabel);
        counter++;
    }

    return section;
}

/**
 * This function creates a Label that contains a img and a checkbox so you can select it.
 * @param imgPath The path to the img source.
 * @returns A HtmlDivElement
 */
function createNewSlideSelection(imgPath: string, id: string, slideWithPath: SlideWithPath): HTMLDivElement {
    const div = document.createElement("div");
    div.classList.add("selection-slide");

    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.id = id;
    selectedNewSlidesInputs.push(checkboxInput);
    selectedNewSlides.push(slideWithPath);
    div.appendChild(checkboxInput);

    const slideLabel = document.createElement("label");

    const slideImg = document.createElement("img");
    slideImg.src = imgPath;
    slideLabel.appendChild(slideImg);
    slideLabel.htmlFor = id;
    div.appendChild(slideLabel);

    return div;
}
