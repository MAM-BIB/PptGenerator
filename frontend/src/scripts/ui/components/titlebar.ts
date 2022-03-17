import { ipcRenderer } from "electron";
import { TitlebarOptions } from "../../interfaces/interfaces";

let minimizeBtn: HTMLButtonElement;
let maximizeBtn: HTMLButtonElement;
let closeBtn: HTMLButtonElement;

let fileBtn: HTMLButtonElement;
let optionBtn: HTMLButtonElement;
let helpBtn: HTMLButtonElement;

export default function initTitlebar(options?: TitlebarOptions) {
    createTitlebar(options);
    addEventListener(options);
}

// Create the Titlebar
function createTitlebar(options?: TitlebarOptions) {
    const mainApp = document.createElement("div");
    mainApp.className = "main-app";
    const topBar = document.createElement("div");
    topBar.className = "top-bar";

    const titleBarLeft = document.createElement("div");
    titleBarLeft.className = "title-bar-left-btns";
    fileBtn = document.createElement("button");
    fileBtn.innerText = "File";
    fileBtn.hidden = options?.menuHidden ?? false;
    fileBtn.classList.add("left-btn");
    fileBtn.classList.add("file-btn");
    optionBtn = document.createElement("button");
    optionBtn.innerText = "Option";
    optionBtn.hidden = options?.menuHidden ?? false;
    optionBtn.classList.add("left-btn");
    optionBtn.classList.add("option-btn");
    helpBtn = document.createElement("button");
    helpBtn.innerText = "Help";
    helpBtn.hidden = options?.menuHidden ?? false;
    helpBtn.classList.add("left-btn");
    helpBtn.classList.add("help-btn");

    const title = document.createElement("div");
    title.innerText = options?.title ?? "PptGenerator";
    title.className = "title";

    const titleBarBtns = document.createElement("div");
    titleBarBtns.className = "title-bar-btns";
    minimizeBtn = document.createElement("button");
    minimizeBtn.title = "Minimize";
    minimizeBtn.classList.add("top-btn");
    minimizeBtn.classList.add("minimize-btn");
    const svgMinimize = document.createElement("div");
    svgMinimize.className = "svg";
    maximizeBtn = document.createElement("button");
    maximizeBtn.title = "Maximize";
    maximizeBtn.disabled = !(options?.resizable ?? true);
    maximizeBtn.classList.add("top-btn");
    maximizeBtn.classList.add("maximize-btn");
    const svgMaximize = document.createElement("div");
    svgMaximize.className = "svg";
    const svgrestore = document.createElement("div");
    svgrestore.className = "svg";
    svgrestore.hidden = true;
    closeBtn = document.createElement("button");
    closeBtn.title = "Close";
    closeBtn.classList.add("top-btn");
    closeBtn.classList.add("close-btn");
    const svgClose = document.createElement("div");
    svgClose.className = "svg";

    minimizeBtn.appendChild(svgMinimize);
    titleBarBtns.appendChild(minimizeBtn);
    maximizeBtn.appendChild(svgMaximize);
    titleBarBtns.appendChild(maximizeBtn);
    closeBtn.appendChild(svgClose);
    titleBarBtns.appendChild(closeBtn);
    titleBarLeft.appendChild(fileBtn);
    titleBarLeft.appendChild(optionBtn);
    titleBarLeft.appendChild(helpBtn);
    topBar.appendChild(titleBarLeft);

    topBar.appendChild(title);
    topBar.appendChild(titleBarBtns);

    mainApp.appendChild(topBar);
    document.body.insertAdjacentElement("afterbegin", mainApp);
}

function addEventListener(options?: TitlebarOptions) {
    fileBtn.addEventListener("click", () => {});
    optionBtn.addEventListener("click", () => {});
    helpBtn.addEventListener("click", () => {});
    minimizeBtn.addEventListener("click", () => {
        ipcRenderer.invoke("minimizeWindow");
    });
    maximizeBtn.addEventListener("click", () => {
        ipcRenderer.invoke("maxAndRestoreWindow");
    });
    closeBtn.addEventListener("click", () => {
        ipcRenderer.invoke(options?.closeBtnMsg ?? "closeFocusedWindow");
    });
}
