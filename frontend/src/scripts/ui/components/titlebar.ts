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
    const titleBarLeft = document.createElement("nav");
    titleBarLeft.className = "title-bar-left-btns";

    const mainUl = document.createElement("ul");
    titleBarLeft.appendChild(mainUl);
    const mainFileLi = document.createElement("li");

    createFileMenu(mainFileLi);
    mainUl.appendChild(mainFileLi);

    const mainOptionLi = document.createElement("li");
    mainUl.appendChild(mainOptionLi);
    createOptionMenu(mainOptionLi);

    const mainHelpLi = document.createElement("li");
    mainUl.appendChild(mainHelpLi);
    createHelpMenu(mainHelpLi);

    titleBarLeft.appendChild(mainUl);
    return titleBarLeft;
}

// Create The File Menu
function createFileMenu(mainFileLi: HTMLElement) {
    const fileBtn = document.createElement("button");
    fileBtn.innerText = "File";
    fileBtn.classList.add("left-btn");
    fileBtn.classList.add("file-btn");
    mainFileLi.appendChild(fileBtn);

    const fileUl = document.createElement("ul");

    const reloadLi = document.createElement("li");
    const reloadBtn = document.createElement("button");
    reloadBtn.innerText = "Reload CTRL+R";
    // class
    reloadLi.appendChild(reloadBtn);
    fileUl.appendChild(reloadLi);

    const devToolsLi = document.createElement("li");
    const devToolsBtn = document.createElement("button");
    devToolsBtn.innerText = "DevTools F12";
    devToolsLi.appendChild(devToolsBtn);
    fileUl.appendChild(devToolsLi);

    const scanLi = document.createElement("li");
    const scanBtn = document.createElement("button");
    scanBtn.innerText = "Scan CTRL+I";
    scanLi.appendChild(scanBtn);
    fileUl.appendChild(scanLi);

    const exitLi = document.createElement("li");
    const exitBtn = document.createElement("button");
    exitBtn.innerText = "Scan ALT+F4";
    exitLi.appendChild(exitBtn);
    fileUl.appendChild(exitLi);

    mainFileLi.appendChild(fileUl);
}

// Create The Option Menu
function createOptionMenu(mainOptionLi: HTMLElement) {
    const optionBtn = document.createElement("button");
    optionBtn.innerText = "Option";
    optionBtn.classList.add("left-btn");
    optionBtn.classList.add("option-btn");
    mainOptionLi.appendChild(optionBtn);

    const optionUl = document.createElement("ul");

    const optionLi = document.createElement("li");
    const openOptionBtn = document.createElement("button");
    openOptionBtn.innerText = "Open Option CTRL+O";
    optionLi.appendChild(openOptionBtn);
    optionUl.appendChild(optionLi);

    mainOptionLi.appendChild(optionUl);
}

// Create The Help Menu
function createHelpMenu(mainHelpLi: HTMLElement) {
    const helpBtn = document.createElement("button");
    helpBtn.innerText = "Help";
    helpBtn.classList.add("left-btn");
    helpBtn.classList.add("help-btn");
    mainHelpLi.appendChild(helpBtn);

    const helpUl = document.createElement("ul");

    const helpLi = document.createElement("li");
    const infoBtn = document.createElement("button");
    infoBtn.innerText = "Open info";
    infoBtn.addEventListener("click", async () => {
        await ipcRenderer.invoke("openWindow", "help.html", {
            width: 800,
            height: 600,
            minWidth: 500,
            minHeight: 400,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            autoHideMenuBar: true,
            modal: false,
        });
    });
    helpLi.appendChild(infoBtn);
    helpUl.appendChild(helpLi);

    mainHelpLi.appendChild(helpUl);
}
