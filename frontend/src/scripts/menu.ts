import { app, BrowserWindow, Menu, MenuItem } from "electron";
import path from "path";
import fsBase from "fs";

import { getConfig } from "./config";
import openPopup from "./helper";
import { Presentation, Slide } from "./interfaces/interfaces";
import call from "./systemcall";

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
                        reload(item, focusedWindow);
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
                    async click(item, focusedWindow) {
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
                        reload(item, focusedWindow);
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

function reload(item: MenuItem, focusedWindow: BrowserWindow | undefined) {
    if (focusedWindow) {
        // After overloading, refresh and close all secondary forms
        if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach((win) => {
                if (win.id > 1) {
                    win.close();
                }
            });
        }
        focusedWindow.reload();
    }
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

    // for (const presentation of presentations) {
    //     for (const section of presentation.Sections) {
    //         for (const slide of section.Slides) {
    //             const slideTitle = slide.Title;
    //             const slidePos = slide.Position + 1;
    //             if (slide.Uid === "") {
    //                 errors.push(`The following slide has no uid:\n${slideTitle}, pos: ${slidePos}`);
    //             } else if (uids.includes(slide.Uid)) {
    //                 const oldSlide = section.Slides.find((elem) => elem.Uid === slide.Uid);
    //                 const slideTitel2 = oldSlide?.Title;
    //                 const slidePos2 = oldSlide?.Position;
    //                 errors.push(`The following slides have the same uid:
    //                 \n${slideTitel2}, pos: ${slidePos2}
    //                 \n${slideTitle}, pos: ${slidePos}`);
    //             } else {
    //                 uids.push(slide.Uid);
    //             }
    //         }
    //     }
    // }

    // if (errors.length > 0) {
    //     let errString = "";
    //     for (const error of errors) {
    //         errString += `${error}\n`;
    //     }
    //     openPopup({ text: errString, heading: "Error" });
    // }
}
