import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import fsBase from "fs";

import { getConfig } from "./config";
import openPopup from "./helper/popup";
import { Presentation, Slide } from "./interfaces/interfaces";
import call from "./helper/systemcall";
import reload from "./helper/reload";

const fs = fsBase.promises;

export default function initMenu(mainWindow: BrowserWindow) {
    const menu = Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [
                {
                    label: "Open Dev tools",
                    accelerator: "F12",
                    click(item, focusedWindow) {
                        focusedWindow?.webContents.openDevTools();
                        if (focusedWindow !== undefined && focusedWindow.getSize()[0] < 800) {
                            focusedWindow.setSize(800, focusedWindow.getSize()[1]);
                        }
                    },
                },
                {
                    label: "Reload",
                    accelerator: "CmdOrCtrl+R",
                    click(item, focusedWindow) {
                        reload(focusedWindow);
                    },
                },
                {
                    label: "Exit",
                    accelerator: "Alt+F4",
                    click() {
                        app.quit();
                    },
                },
                {
                    label: "Scan Presentation",
                    accelerator: "CmdOrCtrl+I",
                    async click(item, focusedWindow) {
                        focusedWindow?.webContents.send("startLoading");
                        try {
                            await call(getConfig().coreApplication, [
                                "-inPath",
                                ...getConfig()
                                    .presentationMasters.flatMap((master) => master.paths)
                                    .map((elem) => path.normalize(elem))
                                    .filter((elem, index, array) => array.indexOf(elem) === index),
                                "-outPath",
                                getConfig().metaJsonPath,
                            ]);
                        } catch (error) {
                            await openPopup({
                                text: `The process exited with errors!\n${error}`,
                                heading: "Error",
                                answer: true,
                            });
                        }
                        reload(focusedWindow);
                        checkUids();
                    },
                },
                {
                    label: "getConfig",
                    click() {
                        getConfig();
                    },
                },
                {
                    label: "Option",
                    accelerator: "CmdOrCtrl+O",
                    click() {
                        openOption(mainWindow);
                    },
                },
            ],
        },
    ]);

    Menu.setApplicationMenu(menu);
}

function openOption(parent: BrowserWindow) {
    const optionWindow = new BrowserWindow({
        width: 600,
        height: 600,
        resizable: false,
        useContentSize: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
        modal: true,
        parent,
    });
    const indexHTML = path.join(__dirname, "views/option.html");
    optionWindow.loadFile(indexHTML);
}

function formatSlide(slides: Slide[]): string {
    return slides
        .map((slide) => `Slide ${slide.Position + 1}: ${slide.Title || "No Title"} (UID:${slide.Uid})`)
        .join("\n");
}

async function checkUids() {
    const presentationsJson = await fs.readFile(getConfig().metaJsonPath, { encoding: "utf-8" });
    const presentations: Presentation[] = JSON.parse(presentationsJson) as Presentation[];
    // const uids: string[] = [];
    // const errors: string[] = [];
    const allSlides = presentations.flatMap((pres) => pres.Sections.flatMap((section) => section.Slides));
    const slidesHashMap: { [key: string]: Slide } = {};
    const duplicatedUidSlides: Slide[][] = [];
    const wrongUidSlides: Slide[] = [];

    for (const slide of allSlides) {
        if (slide.Uid.length < 5) {
            wrongUidSlides.push(slide);
        } else if (slidesHashMap[slide.Uid]) {
            duplicatedUidSlides.push([slidesHashMap[slide.Uid], slide]);
        }
        slidesHashMap[slide.Uid] = slide;
    }

    if (duplicatedUidSlides.length > 0 || wrongUidSlides.length > 0) {
        let text = "";
        if (duplicatedUidSlides.length > 0) {
            text += `Slides with duplicated Uid(${duplicatedUidSlides.length}):\n\n${duplicatedUidSlides
                .map((elem) => formatSlide(elem))
                .join("\n\n")}\n`;
        }
        if (wrongUidSlides.length > 0) {
            text += `\nSlides with incorrect Uid(${wrongUidSlides.length}):\n\n${formatSlide(wrongUidSlides)}`;
        }
        openPopup({
            text,
            heading: "Error",
        });
    }
}
