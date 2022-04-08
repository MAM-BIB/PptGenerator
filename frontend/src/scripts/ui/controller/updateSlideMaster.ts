import { ipcRenderer } from "electron";
import fs from "fs";

import initTitlebar from "../components/titlebar";
import { ScanData, SlidesMap, SlidesMapMap, SlideWithPath, SlideWithPathAndImg } from "../../interfaces/container";
import call from "../../helper/systemcall";
import { getConfig } from "../../helper/config";
import { Presentation } from "../../interfaces/presentation";
import { startLoading, stopLoading } from "../components/loading";
import isRunning, { killPpt, sleep } from "../../helper/processManager";
import openPopup from "../../helper/openPopup";

const selectionContainer = document.getElementById("uid-section");
const cancelButton = document.getElementById("cancel-btn");
const historyToggleBtn = document.getElementById("add-to-history-toggle-btn") as HTMLInputElement;
const updateButton = document.getElementById("update-btn");
const historyToggleSection = document.getElementById("history-toggle-section");

let selectedUpdateSlidesInputs: HTMLInputElement[] = [];
const selectedNewSlidesInputs: HTMLInputElement[] = [];
const selectedUpdateSlides: SlideWithPath[] = [];
const selectedNewSlides: SlideWithPath[] = [];

const metaJson = fs.readFileSync(getConfig().metaJsonPath, { encoding: "utf-8" });
const meta = JSON.parse(metaJson) as Presentation[];

let scanBeforeClosing = false;
const metaSelect = createMetaSelect();

// Initialization of the custom titlebar.
initTitlebar({
    resizable: true,
    menuHidden: true,
    title: "PptGenerator-Update",
});

/**
 * This will be called when the window opens
 */
ipcRenderer.on("data", (event, { updateUids, newSlides }: ScanData) => {
    loadContent(updateUids);
    if (selectedUpdateSlidesInputs.length === 0) {
        rebuildWindowForNewSlides(newSlides);
    }

    /**
     * Add the event to the update button
     */
    updateButton?.addEventListener("click", async () => {
        if (selectedUpdateSlidesInputs.length > 0) {
            startLoading();
            await handleUpdateSlides(updateUids);
            rebuildWindowForNewSlides(newSlides);
            stopLoading();
        } else {
            startLoading();
            await handleNewSlides();

            scanAndClose();
        }
    });
});

/**
 * Try to scan and then close the window
 */
async function scanAndClose() {
    startLoading();
    if (isRunning("POWERPNT")) {
        const answer = await openPopup({
            text: "We detected that PowerPoint is open. Please close the process",
            heading: "Warning",
            primaryButton: "Kill PowerPoint",
            secondaryButton: "Cancel",
            answer: true,
        });
        if (answer) {
            killPpt();
            while (isRunning("POWERPNT")) {
                // eslint-disable-next-line no-await-in-loop
                await sleep(1000);
            }
            await ipcRenderer.invoke("ScanWindowAndClose");
        }
    } else {
        await ipcRenderer.invoke("ScanWindowAndClose");
    }
}

/**
 * Get all selected new slides and add them to the slide master
 */
async function handleNewSlides() {
    const slidesNew: { [path: string]: SlideWithPath[] } = {};

    // saves all selected slides that are new
    for (let index = 0; index < selectedNewSlidesInputs.length; index++) {
        const checkbox = selectedNewSlidesInputs[index];
        if (checkbox.checked) {
            if (slidesNew[selectedNewSlides[index].path]) {
                slidesNew[selectedNewSlides[index].path].push(selectedNewSlides[index]);
            } else {
                slidesNew[selectedNewSlides[index].path] = [selectedNewSlides[index]];
            }
        }
    }

    const outPath = metaSelect.value;
    // prepare to call the program
    for (const inPath in slidesNew) {
        if (Object.prototype.hasOwnProperty.call(slidesNew, inPath)) {
            scanBeforeClosing = true;
            const slides = slidesNew[inPath];

            // eslint-disable-next-line no-await-in-loop
            await call(getConfig().coreApplication, [
                "-mode",
                "create",
                "-inPath",
                inPath,
                "-outPath",
                outPath,
                "-slidePos",
                slides.map((slide) => slide.slide.Position).join(","),
            ]);
        }
    }
}

/**
 * Get all selected changed slides and update the slide master
 * @param updateUids the changed slides that were detected
 */
async function handleUpdateSlides(updateUids: { [uid: string]: SlideWithPathAndImg[] }) {
    const updateSlides: SlidesMapMap = {};

    for (let index = 0; index < selectedUpdateSlidesInputs.length; index++) {
        const radioButton = selectedUpdateSlidesInputs[index];
        if (radioButton.checked) {
            const slideWithPath = selectedUpdateSlides[index];

            // Get the path of the masterPresentation
            const outPath = updateUids[slideWithPath.slide.Uid][0].path;

            if (!updateSlides[slideWithPath.path]) {
                // save a HashMap of the selected slides sorted by the path of masterPresentation
                const obj: SlidesMap = {};
                obj[outPath] = [slideWithPath.slide];
                updateSlides[slideWithPath.path] = obj;
            } else if (!updateSlides[slideWithPath.path][outPath]) {
                // Creates new Array with slide
                updateSlides[slideWithPath.path][outPath] = [slideWithPath.slide];
            } else {
                // Pushes slide in Array
                updateSlides[slideWithPath.path][outPath].push(slideWithPath.slide);
            }
        } else if (historyToggleBtn.checked) {
            addHashToHistory(selectedUpdateSlides[index]);
        }
    }

    if (historyToggleBtn.checked) {
        fs.writeFileSync(getConfig().metaJsonPath, JSON.stringify(meta, null, "\t"));
    }

    // prepare to call the program
    for (const inPath in updateSlides) {
        if (Object.prototype.hasOwnProperty.call(updateSlides, inPath)) {
            const slidesMap = updateSlides[inPath];
            for (const outPath in slidesMap) {
                if (Object.prototype.hasOwnProperty.call(slidesMap, outPath)) {
                    scanBeforeClosing = true;
                    const slides = slidesMap[outPath];
                    const replace = slides.map((slide) => updateUids[slide.Uid][0].slide.Position);
                    // eslint-disable-next-line no-await-in-loop
                    await call(getConfig().coreApplication, [
                        "-mode",
                        "create",
                        "-inPath",
                        inPath,
                        "-outPath",
                        outPath,
                        "-slidePos",
                        slides.map((slide) => slide.Position).join(","),
                        "-replace",
                        replace.join(","),
                    ]);
                }
            }
        }
    }
}

/**
 * Transform the window to show the new slides
 * @param newSlides the new html elements
 */
function rebuildWindowForNewSlides(newSlides: SlideWithPathAndImg[]) {
    if (selectionContainer) selectionContainer.innerHTML = "";
    if (historyToggleSection) historyToggleSection.innerHTML = "";
    if (updateButton) updateButton.textContent = "Add Slides";
    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            scanAndClose();
        });
    }
    historyToggleSection?.appendChild(metaSelect);
    selectedUpdateSlidesInputs = [];
    loadNewSlides(newSlides);
}

/**
 * Add the event to the cancel button
 */
cancelButton?.addEventListener("click", () => {
    if (scanBeforeClosing) {
        ipcRenderer.invoke("ScanWindowAndClose");
    } else {
        ipcRenderer.invoke("closeFocusedWindow");
    }
});

/**
 * This function loads creates the content for the window.
 * @param updateUids A HashMap with UIDs as key and slides as values that can be updated
 * @param newSlides A Collection of Slides with Path and ImgsPath that are not known to the PresentationMasters
 */
function loadContent(updateUids: { [uid: string]: SlideWithPathAndImg[] }) {
    // goes through the HashMap and saves all the new slides in an Array.
    for (const uid in updateUids) {
        if (Object.prototype.hasOwnProperty.call(updateUids, uid)) {
            const uidWithSlides = updateUids[uid];
            // adds the slides to the window
            selectionContainer?.appendChild(createSection(uidWithSlides, uid));
        }
    }
}

/**
 * Checks if there are unknown slides and adds them to window.
 * @param newSlides
 */
function loadNewSlides(newSlides: SlideWithPathAndImg[]) {
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
            section.appendChild(createSelectionSlideElement(uid, slide.imgPath, uid + counter, true, slide, false));
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
    pushToArr = true,
): HTMLDivElement {
    const div = document.createElement("div");
    div.classList.add("selection-slide");

    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = uid;
    radioInput.id = id;
    radioInput.checked = select;

    if (pushToArr) {
        selectedUpdateSlidesInputs.push(radioInput);
        selectedUpdateSlides.push(slideWithPath);
    }

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
    section.classList.add("slide-section");

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

/**
 * Add a hash to the hash history
 * @param slideWithPath the object with the hash to add
 */
function addHashToHistory(slideWithPath: SlideWithPath) {
    const targetSlide = meta
        .flatMap((pres) => pres.Sections)
        .flatMap((section) => section.Slides)
        .find((slide) => slide.Uid === slideWithPath.slide.Uid);

    if (targetSlide?.History) {
        targetSlide.History.push(slideWithPath.slide.Hash);
    } else if (targetSlide) {
        targetSlide.History = [slideWithPath.slide.Hash];
    }
}

/**
 * Create a select filled with all paths of meta
 * @returns a select filled with all paths of meta
 */
function createMetaSelect(): HTMLSelectElement {
    const select = document.createElement("select");
    select.style.minWidth = "0";

    for (const presentation of meta) {
        const option = document.createElement("option");
        option.textContent = presentation.Path;
        select.append(option);
    }

    return select;
}
