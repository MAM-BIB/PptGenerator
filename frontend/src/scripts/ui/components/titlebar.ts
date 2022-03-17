import { ipcRenderer } from "electron";

let minimizeBtn: HTMLButtonElement;
let maximizeBtn: HTMLButtonElement;
let closeBtn: HTMLButtonElement;

let fileBtn: HTMLButtonElement;
let optionBtn: HTMLButtonElement;
let helpBtn: HTMLButtonElement;

createTitlebar();
btnLogic();

// Create the Titlebar
function createTitlebar() {
    const mainApp = document.createElement("div");
    mainApp.className = "main-app";
    const topBar = document.createElement("div");
    topBar.className = "top-bar";

    const titleBarLeft = document.createElement("div");
    titleBarLeft.className = "title-bar-left-btns";
    fileBtn = document.createElement("button");
    fileBtn.innerText = "File";
    fileBtn.classList.add("left-btn");
    fileBtn.classList.add("file-btn");
    optionBtn = document.createElement("button");
    optionBtn.innerText = "Option";
    optionBtn.classList.add("left-btn");
    optionBtn.classList.add("option-btn");
    helpBtn = document.createElement("button");
    helpBtn.innerText = "Help";
    helpBtn.classList.add("left-btn");
    helpBtn.classList.add("help-btn");

    const title = document.createElement("div");
    title.innerText = "PptGenerator";
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
    maximizeBtn.classList.add("top-btn");
    maximizeBtn.classList.add("maximize-btn");
    const svgMaximize = document.createElement("div");
    svgMaximize.className = "svg";
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

function btnLogic() {
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
        ipcRenderer.invoke("closeFocusedWindow");
    });
}
