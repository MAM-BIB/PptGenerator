import { ipcRenderer } from "electron";
import path from "path";
import fsBase from "fs";
import call from "../../helper/systemcall";

import { Slide } from "../../interfaces/presentation";
import { DuplicatedUids, SlideWithPath } from "../../interfaces/container";
import initTitlebar from "../components/titlebar";
import { getConfig } from "../../helper/config";
import { startLoading } from "../components/loading";
import openPopup from "../../helper/openPopup";
import checkForImg from "../../helper/imageLoader";

const duplicatedUidSection = document.getElementById("duplicated-uid-section") as HTMLDivElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const changeUidsBtn = document.getElementById("change-uids-btn") as HTMLButtonElement;

const inputsWithMatchingSlides: { input: HTMLInputElement; slide: SlideWithPath }[] = [];

let duplicatedUids: DuplicatedUids;
const fs = fsBase.promises;

/**
 * This will be called when the window opens
 */
ipcRenderer.on("data", (event, data) => {
    duplicatedUids = data;
    const duplicatedUidSlides = duplicatedUids.uid;

    initTitlebar({
        resizable: false,
        menuHidden: true,
        title: "PptGenerator-duplicated Uids",
        closeBtnMsg: duplicatedUids.answer as string,
    });

    for (const uid in duplicatedUidSlides) {
        if (Object.prototype.hasOwnProperty.call(duplicatedUidSlides, uid)) {
            createMainDiv(uid, duplicatedUidSlides[uid]);
        }
    }
});

/**
 * Adds the eventListener for the cancel button
 */
cancelBtn.addEventListener("click", async () => {
    ipcRenderer.invoke((duplicatedUids?.answer as string) ?? "closeFocusedWindow", false);
});

/**
 * Adds the eventListener for the change uid button
 */
changeUidsBtn.addEventListener("click", async () => {
    startLoading();
    await replaceDuplicated();
    ipcRenderer.invoke((duplicatedUids?.answer as string) ?? "closeFocusedWindow", true);
});

/**
 * This function creates the main div in which a duplicated uid will be displayed.
 * @param uid The uid from a slide.
 * @param slides The path from a presentation and all slides from that path.
 */
function createMainDiv(uid: string, slides: SlideWithPath[]) {
    const uidMainDiv = document.createElement("div");
    uidMainDiv.className = "main-div";

    const duplicatedUidTitleContainer = document.createElement("div");
    duplicatedUidTitleContainer.className = "uid-title-container";

    createHeader(uid, duplicatedUidTitleContainer);

    uidMainDiv.appendChild(duplicatedUidTitleContainer);

    let isInputChecked = false;
    const sameHashes: { [hash: string]: Slide[] } = {};
    for (const slide of slides) {
        uidMainDiv.appendChild(createDivPresentationName(slide, isInputChecked));
        isInputChecked = true;

        if (!sameHashes[slide.slide.Hash]) sameHashes[slide.slide.Hash] = [];
        sameHashes[slide.slide.Hash].push(slide.slide);
    }
    const presentationNameContainer = document.createElement("div");
    presentationNameContainer.className = "presNameContainer";

    for (const hash in sameHashes) {
        if (Object.prototype.hasOwnProperty.call(sameHashes, hash)) {
            const s = sameHashes[hash];
            if (s.length > 1) {
                const slideNames = s.flatMap((item) => `'${item.Title || "No Title"}'`).join(" and ");
                uidMainDiv.append(document.createTextNode(`${slideNames} seem to be the same!`));
            }
        }
    }

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
function createDivPresentationName(slide: SlideWithPath, isInputChecked: boolean): HTMLDivElement {
    const presentationDiv = document.createElement("div");
    presentationDiv.className = "presentation-name";

    const presentationName = document.createElement("h3");
    presentationName.className = "";
    presentationName.textContent = `${path.parse(slide.path).name}`;
    presentationDiv.appendChild(presentationName);

    presentationDiv.appendChild(createDivSlideName(slide, isInputChecked));

    return presentationDiv;
}

/**
 * This function creates the slide with the name and position of the slide.
 * @param slide The slide that has a duplicated UID.
 * @returns The div in which the SlideName will be in.
 */
function createDivSlideName(slide: SlideWithPath, isInputChecked: boolean): HTMLDivElement {
    const slideDiv = document.createElement("div");
    slideDiv.className = "slide-name-with-checkbox";

    const lblWithImgDiv = document.createElement("div");
    lblWithImgDiv.className = "lbl-with-img";
    const slideName = document.createElement("label");
    slideName.className = "slide-name";
    slideName.textContent = `Slide ${[slide.slide.Position + 1]} : ${[slide.slide.Title || "No Title"]}`;

    lblWithImgDiv.appendChild(slideName);

    lblWithImgDiv.appendChild(createImgToSlide(slide));

    slideDiv.appendChild(lblWithImgDiv);
    slideDiv.appendChild(createCheckbox(slide, isInputChecked));
    return slideDiv;
}

/**
 * This function creates the Image of the slide.
 * @param slide The slide that has a duplicated UID.
 * @returns The Image in which the img will be.
 */
function createImgToSlide(slide: SlideWithPath) {
    const presentationPaths = getConfig()
        .presentationMasters.flatMap((master) => master.paths)
        .map((elem) => path.normalize(elem))
        .filter((elem, index, array) => array.indexOf(elem) === index);

    const imgFolder = presentationPaths.indexOf(slide.path);
    const imgPath = path.resolve(getConfig().metaPicsPath, imgFolder.toString(), `${slide.slide.Position + 1}.jpg`);

    const img = document.createElement("img");
    img.alt = "";
    img.style.display = "none";
    img.loading = "lazy";
    img.addEventListener("error", () => {
        checkForImg(img, imgPath, true);
    });
    img.addEventListener("load", () => {
        img.style.display = "";
    });
    checkForImg(img, imgPath);
    onImgClick(img, imgPath);
    return img;
}

/**
 * This function opens a new window and passes the path
 * @param img The Image of the Slide
 * @param imgPath The Path from the Image
 */
function onImgClick(img: HTMLImageElement, imgPath: string) {
    img.addEventListener("click", async () => {
        await ipcRenderer.invoke(
            "openWindow",
            "openImg.html",
            {
                width: 500,
                height: 300,
                minWidth: 500,
                minHeight: 300,
                frame: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
                autoHideMenuBar: true,
                modal: false,
            },
            imgPath,
        );
    });
}

/**
 * This function creates a checkbox to select a slide.
 * @returns The div in which the checkbox will be in
 */
function createCheckbox(slide: SlideWithPath, checked: boolean): HTMLDivElement {
    const sectionToggleBtnDiv = document.createElement("div");
    sectionToggleBtnDiv.className = "section toggle-button";

    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "checkbox-toggle-btn";

    const switchLbl = document.createElement("label");
    switchLbl.className = "switch";

    const inputCheckbox = document.createElement("input");
    inputCheckbox.type = "checkbox";
    inputCheckbox.id = "ignore-hidden-slides-toggle-btn";
    inputCheckbox.checked = checked;
    inputCheckbox.addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).key === "Enter") {
            inputCheckbox.checked = !inputCheckbox.checked;
            changeUidsBtn.disabled = false;
        }
    });

    inputsWithMatchingSlides.push({
        input: inputCheckbox,
        slide,
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

/**
 * This function replaces all uids from the selected slides
 */
async function replaceDuplicated() {
    const uidChangeMap: { [path: string]: Slide[] } = {};

    for (const inputWithMatchingSlide of inputsWithMatchingSlides) {
        if (inputWithMatchingSlide.input.checked) {
            const normalizedPath = path.normalize(inputWithMatchingSlide.slide.path);
            if (!uidChangeMap[normalizedPath]) {
                uidChangeMap[normalizedPath] = [];
            }
            uidChangeMap[normalizedPath].push(inputWithMatchingSlide.slide.slide);
        }
    }

    // informs the user about a backup
    await openPopup({
        text: `Backup will be created at: ${getConfig().backupPath}`,
        heading: "Info",
        answer: true,
    });

    try {
        for (const normalizedPath in uidChangeMap) {
            if (Object.prototype.hasOwnProperty.call(uidChangeMap, normalizedPath)) {
                // eslint-disable-next-line no-await-in-loop
                await changeUid(normalizedPath, uidChangeMap[normalizedPath], duplicatedUids.existingUids ?? []);
            }
        }
    } catch (error) {
        // popup if the core application failed
        await openPopup({
            text: `The process exited with errors!\n${error}`,
            heading: "Error",
            answer: true,
        });
    }
}

/**
 * The function changes the uid for one slide
 * @param pathWithSlides The slide with the path that gets a new uid
 * @param existingUids All existing uids in the saved presentations
 */
async function changeUid(normalizedPath: string, slides: Slide[], existingUids: string[]) {
    // creating a backup before changing the presentation
    await fs.copyFile(normalizedPath, path.join(getConfig().backupPath, path.basename(normalizedPath)));

    // calling the core application
    await call(getConfig().coreApplication, [
        "-mode",
        "addUid",
        "-inPath",
        normalizedPath,
        "-slidePos",
        slides.map((slide) => slide.Position).join(","),
        "-existingUids",
        ...existingUids,
    ]);
}
