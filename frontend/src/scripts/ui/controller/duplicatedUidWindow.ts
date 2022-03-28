import { ipcRenderer } from "electron";
import path from "path";
import call from "../../helper/systemcall";

import { DuplicatedUids, PathWithSlides } from "../../interfaces/interfaces";
import initTitlebar from "../components/titlebar";

const duplicatedUidSection = document.getElementById("duplicated-uid-section") as HTMLDivElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const changeUidsBtn = document.getElementById("change-uids-btn") as HTMLButtonElement;

let options: DuplicatedUids;

/**
 * This will be called when the window opens
 */
ipcRenderer.on("data", (event, data) => {
    initTitlebar({
        resizable: false,
        menuHidden: true,
        title: "PptGenerator-duplicated Uids",
    });
    options = data;
    const duplicatedUidSlides = options.uid;
    for (const uid in duplicatedUidSlides) {
        if (Object.prototype.hasOwnProperty.call(duplicatedUidSlides, uid)) {
            createMainDiv(uid, duplicatedUidSlides[uid]);
        }
    }
});

/**
 * Adds the eventListener vor the cancel button
 */
cancelBtn.addEventListener("click", async () => {
    await ipcRenderer.invoke("closeFocusedWindow");
});

/**
 * Adds the eventListener vor the change uid button
 */
changeUidsBtn.addEventListener("click", async () => {
    // if(){
    //     call();
    // }
});

/**
 * This function creates the main div in which a duplicated uid will be displayed.
 * @param uid The uid from a slide.
 * @param slides The path from a presentation and all slides from that path.
 */
function createMainDiv(uid: string, slides: PathWithSlides[]) {
    const uidMainDiv = document.createElement("div");
    uidMainDiv.className = "main-div";

    const duplicatedUidTitleContainer = document.createElement("div");
    duplicatedUidTitleContainer.className = "uid-title-container";

    createHeader(uid, duplicatedUidTitleContainer);

    uidMainDiv.appendChild(duplicatedUidTitleContainer);

    for (const slide of slides) {
        uidMainDiv.appendChild(createDivPresentationName(slide));
    }
    const presentationNameContainer = document.createElement("div");
    presentationNameContainer.className = "presNameContainer";

    duplicatedUidSection.appendChild(uidMainDiv);
}

/**
 * This function creates a div where the UID is written in.
 * @param uid A uid from a slide.
 * @param duplicatedUidTitleContainer A html div container where the uid will be in.
 */
function createHeader(uid: string, duplicatedUidTitleContainer: HTMLDivElement) {
    const uidTitle = document.createElement("h2");
    uidTitle.textContent = `UID: ${uid}`;
    duplicatedUidTitleContainer.appendChild(uidTitle);

    const line = document.createElement("hr");
    duplicatedUidTitleContainer.appendChild(line);
}

/**
 * This Functions creates a div where the Name of the presentation and slides are in.
 * @param slide The slide that has a duplicated UID.
 * @returns The div in which the PresentationName will be in.
 */
function createDivPresentationName(slide: PathWithSlides): HTMLDivElement {
    const presentationDiv = document.createElement("div");
    presentationDiv.className = "presentationame";

    const presentationName = document.createElement("h3");
    presentationName.className = "";
    presentationName.textContent = `${path.parse(slide.path).name}`;
    presentationDiv.appendChild(presentationName);

    presentationDiv.appendChild(createDivSlideName(slide));

    return presentationDiv;
}

/**
 * This function creates the slide with the name and position of the slide.
 * @param slide The slide that has a duplicated UID.
 * @returns The div in which the SlideName will be in.
 */
function createDivSlideName(slide: PathWithSlides): HTMLDivElement {
    const slideDiv = document.createElement("div");
    slideDiv.className = "slidename-with-checkbox";

    const slideName = document.createElement("label");
    slideName.className = "slide-name";
    slideName.textContent = `Slide ${[slide.slide.Position + 1]} : ${[slide.slide.Title || "No Title"]}`;

    slideDiv.appendChild(slideName);

    slideDiv.appendChild(createCheckbox());

    return slideDiv;
}

/**
 * This function creates a checkbox to select a slide.
 * @returns The div in which the checkbox will be in
 */
function createCheckbox(): HTMLDivElement {
    const sectionToggleBtnDiv = document.createElement("div");
    sectionToggleBtnDiv.className = "section toggle-button";

    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "checkbox-toggle-btn";

    const switchLbl = document.createElement("label");
    switchLbl.className = "switch";

    const inputCheckbox = document.createElement("input");
    inputCheckbox.type = "checkbox";
    inputCheckbox.id = "ignore-hidden-slides-toggle-btn";
    inputCheckbox.addEventListener("change", () => {
        changeUidsBtn.disabled = false;
    });
    switchLbl.appendChild(inputCheckbox);

    const spanSlider = document.createElement("span");
    spanSlider.className = "slider";
    spanSlider.classList.add("round");
    switchLbl.appendChild(spanSlider);

    checkboxDiv.appendChild(switchLbl);

    sectionToggleBtnDiv.appendChild(checkboxDiv);

    return sectionToggleBtnDiv;
}

createCheckbox().addEventListener("change", () => {});
