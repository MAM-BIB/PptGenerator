import { ipcRenderer } from "electron";
import openPopup from "../../helper/openPopup";
import isRunning, { killPpt, sleep } from "../../helper/processManager";
import { TitlebarOptions } from "../../interfaces/windows";

/**
 * This function initializes the custom titlebar for the application.
 * @param options An object of options for the titlebar.
 */
export default function initTitlebar(options?: TitlebarOptions) {
    createTitlebar(options);
}

/**
 * This functions creates the titlebar with all Buttons, Imgs and Texts.
 * @param options An object of options for the titlebar.
 */
function createTitlebar(options?: TitlebarOptions) {
    const mainApp = document.createElement("div");
    mainApp.className = "main-app";

    const topBar = document.createElement("div");
    topBar.className = "top-bar";

    // Create icon
    topBar.appendChild(createIcon());

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
    topBar.appendChild(createBtns(options));

    mainApp.appendChild(topBar);
    document.body.insertAdjacentElement("afterbegin", mainApp);
}

/**
 * This Functions creates a div element for the icon of the app.
 * @returns A html dic element.
 */
function createIcon(): HTMLDivElement {
    const imgDiv = document.createElement("div");
    imgDiv.classList.add("icon");

    return imgDiv;
}

/**
 * This function create all buttons of the titlebar.
 * @param options An object of options for the titlebar.
 * @returns A html div element with all the buttons.
 */
function createBtns(options?: TitlebarOptions): HTMLDivElement {
    const titleBarBtns = document.createElement("div");
    titleBarBtns.className = "title-bar-btns";
    titleBarBtns.appendChild(createMinimizeBtn());
    titleBarBtns.appendChild(createMaximizeBtn(options));
    titleBarBtns.appendChild(createCloseBtn(options));

    return titleBarBtns;
}

/**
 * This function creates the minimize button.
 * @returns A html button element.
 */
function createMinimizeBtn(): HTMLButtonElement {
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

/**
 * This function creates the maximize button.
 * @param options An object of options for the titlebar.
 * @returns A html button element.
 */
function createMaximizeBtn(options?: TitlebarOptions): HTMLButtonElement {
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

/**
 * This functions creates the close button.
 * @param options An object of options for the titlebar.
 * @returns A html div element.
 */
function createCloseBtn(options?: TitlebarOptions): HTMLButtonElement {
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

/**
 * Create a menu with buttons for the application.
 * @returns A html element
 */
function createMenu(): HTMLElement {
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

/**
 * This function will create the File part of the menu.
 * @param mainFileLi The element where the Button will be added.
 */
function createFileMenu(mainFileLi: HTMLElement) {
    const fileBtn = document.createElement("button");
    fileBtn.innerText = "File";
    fileBtn.classList.add("left-btn");
    fileBtn.classList.add("file-btn");
    mainFileLi.appendChild(fileBtn);

    const fileUl = document.createElement("ul");

    const reloadLi = document.createElement("li");
    const reloadBtn = document.createElement("button");
    reloadBtn.innerText = "Reload";
    reloadBtn.appendChild(createHotkey("CTRL+R"));
    reloadBtn.addEventListener("click", () => {
        ipcRenderer.invoke("ReloadWindow");
    });
    reloadLi.appendChild(reloadBtn);
    fileUl.appendChild(reloadLi);

    const scanLi = document.createElement("li");
    const scanBtn = document.createElement("button");
    scanBtn.innerText = "Scan";
    scanBtn.appendChild(createHotkey("CTRL+I"));

    scanBtn.addEventListener("click", async () => {
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
                ipcRenderer.invoke("ScanWindow");
            }
        } else {
            ipcRenderer.invoke("ScanWindow");
        }
    });
    scanLi.appendChild(scanBtn);
    fileUl.appendChild(scanLi);

    const scanFolderLi = document.createElement("li");
    const scanFolderBtn = document.createElement("button");
    scanFolderBtn.appendChild(createHotkey(""));

    scanFolderBtn.innerText = "Scan folder";
    scanFolderBtn.addEventListener("click", async () => {
        ipcRenderer.invoke("scanFolder");
    });
    scanFolderLi.appendChild(scanFolderBtn);
    fileUl.appendChild(scanFolderLi);

    const exitLi = document.createElement("li");
    const exitBtn = document.createElement("button");
    exitBtn.innerText = "Exit";
    exitBtn.appendChild(createHotkey("ALT+F4"));
    exitBtn.addEventListener("click", () => {
        ipcRenderer.invoke("closeFocusedWindow");
    });
    exitLi.appendChild(exitBtn);
    fileUl.appendChild(exitLi);

    mainFileLi.appendChild(fileUl);
}

/**
 * This function will create the Option part of the menu.
 * @param mainOptionLi The element where the Button will be added.
 */
function createOptionMenu(mainOptionLi: HTMLElement) {
    const optionBtn = document.createElement("button");
    optionBtn.innerText = "Option";
    optionBtn.classList.add("left-btn");
    optionBtn.classList.add("option-btn");
    mainOptionLi.appendChild(optionBtn);

    const optionUl = document.createElement("ul");

    const optionLi = document.createElement("li");
    const openOptionBtn = document.createElement("button");
    openOptionBtn.innerText = "Open Option";
    openOptionBtn.appendChild(createHotkey("CTRL+O"));
    openOptionBtn.addEventListener("click", () => {
        ipcRenderer.invoke("openOptionWindow");
    });
    optionLi.appendChild(openOptionBtn);
    optionUl.appendChild(optionLi);

    mainOptionLi.appendChild(optionUl);
}

/**
 * This function will create the Help part of the menu.
 * @param mainHelpLi The element where the Button will be added.
 */
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
            width: 900,
            height: 700,
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

/**
 * This function creates text that displays a hotkey for a specific function.
 * @param hotkey The shortcut text for the hotkey.
 * @returns A html span element.
 */
function createHotkey(hotkey: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.className = "hotkey";
    span.textContent = hotkey;
    return span;
}
