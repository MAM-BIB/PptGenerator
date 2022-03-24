import { ipcRenderer } from "electron";
import path from "path";

import { DuplicatedUids, PathWithSlides } from "../../interfaces/interfaces";
import initTitlebar from "../components/titlebar";

const dupplicatedUidSection = document.getElementById("dupplicated-uid-section") as HTMLDivElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const changeUidsBtn = document.getElementById("change-uids-btn") as HTMLButtonElement;

let options: DuplicatedUids;

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
            createDiv(uid, duplicatedUidSlides[uid]);

            // for (let i = 0; i < array.length; i++) {
            //     const element = array[i];
            // }
            // // uidTitle
            // uidTitle.textContent = `UID:${uid}`;
            // for (const slide of duplicatedUidSlides[uid]) {
            //     text += `\n${path.parse(slide.path).name}\n${[slide.slide]}\n`;
            // }
        }
    }
});

function createDiv(uid: string, slides: PathWithSlides[]) {
    const uidMainDiv = document.createElement("div");
    uidMainDiv.className = "main-div";

    const dublicatedUidTitleContainer = document.createElement("div");
    dublicatedUidTitleContainer.className = "uid-title-container";

    createHeader(uid, dublicatedUidTitleContainer);

    uidMainDiv.appendChild(dublicatedUidTitleContainer);

    for (const slide of slides) {
        createDivPresentationName(slide, uidMainDiv);
    }
    const presentationNameContainer = document.createElement("div");
    presentationNameContainer.className = "presNameContainer";

    dupplicatedUidSection.appendChild(uidMainDiv);
}

function createHeader(uid: string, dublicatedUidTitleContainer: HTMLDivElement) {
    const uidTitle = document.createElement("h2");
    uidTitle.textContent = `UID: ${uid}`;
    dublicatedUidTitleContainer.appendChild(uidTitle);

    const line = document.createElement("hr");
    dublicatedUidTitleContainer.appendChild(line);
}

function createDivPresentationName(slide: PathWithSlides, uidMainDiv: HTMLDivElement) {
    // const slideName = `${path.parse(slide.path).name}`;
    const presentationDiv = document.createElement("div");
    presentationDiv.className = "presentationame";

    const presentationName = document.createElement("h3");
    presentationName.className = "";
    presentationName.textContent = `${path.parse(slide.path).name}`;
    presentationDiv.appendChild(presentationName);

    createDivSlideName(slide, presentationDiv);

    uidMainDiv.appendChild(presentationDiv);
}
function createDivSlideName(slide: PathWithSlides, presentationDiv: HTMLDivElement) {
    const slideDiv = document.createElement("div");
    slideDiv.className = "slidename-with-checkbox";

    const slideName = document.createElement("label");
    slideName.className = "slide-name";
    slideName.textContent = `Slide ${[slide.slide.Position + 1]} : ${[slide.slide.Title || "No Title"]}`;

    slideDiv.appendChild(slideName);

    createCheckbox(slideDiv);

    presentationDiv.appendChild(slideDiv);
}

function createCheckbox(slideDiv: HTMLDivElement) {
    const sectionToggleBtnDiv = document.createElement("div");
    sectionToggleBtnDiv.className = "section toggle-button";

    const checkboxDiv = document.createElement("div");
    checkboxDiv.className = "checkbox-toggle-btn";

    const switchLbl = document.createElement("label");
    switchLbl.className = "switch";

    const inputCheckbox = document.createElement("input");
    inputCheckbox.type = "checkbox";
    inputCheckbox.id = "ignore-hidden-slides-toggle-btn";
    switchLbl.appendChild(inputCheckbox);

    const spanSlider = document.createElement("span");
    spanSlider.className = "slider";
    spanSlider.classList.add("round");
    switchLbl.appendChild(spanSlider);

    checkboxDiv.appendChild(switchLbl);

    checkboxChange(inputCheckbox);
    sectionToggleBtnDiv.appendChild(checkboxDiv);
    slideDiv.appendChild(sectionToggleBtnDiv);
}

function checkboxChange(inputCheckbox: HTMLInputElement) {
    inputCheckbox.addEventListener("change", () => {});
}
// function create(options?: DuplicatedUids) {}
// const texts = options.text?.split("\n") ?? [];
// for (const text of texts) {
//     textElement.append(document.createTextNode(text));
//     textElement.append(document.createElement("br"));
// }
// textElement.lastChild?.remove();

// headingElement.textContent = `${options.heading}`;
// if (options.secondaryButton) {
//     cancelBtn.hidden = false;
//     cancelBtn.textContent = options.secondaryButton;
// }
// if (options.primaryButton) {
//     okBtn.textContent = options.primaryButton;
// }
// cancelBtn.addEventListener("click", () => {
//     ipcRenderer.invoke("closeFocusedWindow");
// });

// okBtn.addEventListener("click", () => {
//     ipcRenderer.invoke("closeFocusedWindow");
// });
