import { ipcRenderer } from "electron";
import { TitlebarOptions } from "../../interfaces/interfaces";

export default function initTitlebar(options?: TitlebarOptions) {
    createTitlebar(options);
}

// Create the Titlebar
function createTitlebar(options?: TitlebarOptions) {
    const mainApp = document.createElement("div");
    mainApp.className = "main-app";

    const topBar = document.createElement("div");
    topBar.className = "top-bar";

    // Create menu
    if (!(options?.menuHidden ?? false)) {
        topBar.appendChild(createMenu());
    }

    // Create title
    const title = document.createElement("div");
    title.innerText = options?.title ?? "PptGenerator";
    title.className = "title";
    topBar.appendChild(title);

    // Create titleBarBtns
    topBar.appendChild(createBtns());

    mainApp.appendChild(topBar);
    document.body.insertAdjacentElement("afterbegin", mainApp);
}

// Create minimize button
function createMinimizeBtn() {
    const minimizeBtn = document.createElement("button");
    minimizeBtn.title = "Minimize";
    minimizeBtn.className = "top-btn minimize-btn";
    minimizeBtn.addEventListener("click", () => {
        ipcRenderer.invoke("minimizeWindow");
    });

    const svgMinimize = document.createElement("div");
    svgMinimize.className = "svg";
    minimizeBtn.appendChild(svgMinimize);

    return minimizeBtn;
}

// Create maximize button
function createMaximizeBtn(options?: TitlebarOptions) {
    const maximizeBtn = document.createElement("button");
    maximizeBtn.title = "Maximize";
    maximizeBtn.disabled = !(options?.resizable ?? true);
    maximizeBtn.className = "top-btn maximize-btn";
    maximizeBtn.addEventListener("click", () => {
        ipcRenderer.invoke("maxAndRestoreWindow");
    });

    const svgMaximize = document.createElement("div");
    svgMaximize.className = "svg";
    maximizeBtn.appendChild(svgMaximize);

    // const svgRestore = document.createElement("div");
    // svgRestore.className = "svg";
    // svgRestore.hidden = true;

    return maximizeBtn;
}

// Create close button
function createCloseBtn(options?: TitlebarOptions) {
    const closeBtn = document.createElement("button");
    closeBtn.title = "Close";
    closeBtn.className = "top-btn close-btn";
    closeBtn.addEventListener("click", () => {
        ipcRenderer.invoke(options?.closeBtnMsg ?? "closeFocusedWindow");
    });

    const svgClose = document.createElement("div");
    svgClose.className = "svg";
    closeBtn.appendChild(svgClose);

    return closeBtn;
}

function createBtns(options?: TitlebarOptions) {
    const titleBarBtns = document.createElement("div");
    titleBarBtns.className = "title-bar-btns";

    titleBarBtns.appendChild(createMinimizeBtn());
    titleBarBtns.appendChild(createMaximizeBtn(options));
    titleBarBtns.appendChild(createCloseBtn(options));

    return titleBarBtns;
}

// Create the menu at the left
function createMenu() {
    const titleBarLeft = document.createElement("div");
    titleBarLeft.className = "title-bar-left-btns";

    const fileBtn = document.createElement("button");
    fileBtn.innerText = "File";
    fileBtn.classList.add("left-btn");
    fileBtn.classList.add("file-btn");
    titleBarLeft.appendChild(fileBtn);

    const optionBtn = document.createElement("button");
    optionBtn.innerText = "Option";
    optionBtn.classList.add("left-btn");
    optionBtn.classList.add("option-btn");
    titleBarLeft.appendChild(optionBtn);

    const helpBtn = document.createElement("button");
    helpBtn.innerText = "Help";
    helpBtn.classList.add("left-btn");
    helpBtn.classList.add("help-btn");
    titleBarLeft.appendChild(helpBtn);

    return titleBarLeft;
}
