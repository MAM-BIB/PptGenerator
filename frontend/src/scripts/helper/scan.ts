import path from "path";
import fsBase from "fs";

import { getConfig } from "../config";
import openPopup from "./popup";
import { Presentation, Slide, UidsWithSlides, SlidesWithPath } from "../interfaces/interfaces";
import call from "./systemcall";
import reload from "./reload";

const fs = fsBase.promises;

export default async function scanPresentations(focusedWindow: Electron.BrowserWindow | null | undefined) {
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
}

export function formatSlide(slides: Slide[]): string {
    return slides
        .map((slide) => ` - Slide ${slide.Position + 1}: ${slide.Title || "No Title"} (UID:${slide.Uid})`)
        .join("\n");
}

export function getAllDuplicatedUidSlides(presentations: Presentation[]): UidsWithSlides {
    const uidsWithSlides: UidsWithSlides = {};

    for (const presentation of presentations) {
        for (const slide of presentation.Sections.flatMap((section) => section.Slides)) {
            if (!uidsWithSlides[slide.Uid]) {
                uidsWithSlides[slide.Uid] = [];
            }
            uidsWithSlides[slide.Uid].push({
                slide,
                path: presentation.Path,
            });
        }
    }

    for (const uid in uidsWithSlides) {
        if (Object.prototype.hasOwnProperty.call(uidsWithSlides, uid)) {
            if (uidsWithSlides[uid].length <= 1) {
                delete uidsWithSlides[uid];
            }
        }
    }

    return uidsWithSlides;
}

export function getAllWrongUidSlides(presentations: Presentation[]): SlidesWithPath[] {
    const wrongUidSlides: SlidesWithPath[] = [];

    for (const presentation of presentations) {
        const slides = presentation.Sections.flatMap((section) => section.Slides).filter(
            (slide) => slide.Uid.length < 5,
        );
        if (slides.length > 0) {
            wrongUidSlides.push({
                path: presentation.Path,
                slides,
            });
        }
    }

    return wrongUidSlides;
}

export async function checkUids() {
    const presentationsJson = await fs.readFile(getConfig().metaJsonPath, { encoding: "utf-8" });
    const presentations: Presentation[] = JSON.parse(presentationsJson) as Presentation[];

    const wrongUidSlides = getAllWrongUidSlides(presentations);
    if (wrongUidSlides.length > 0) {
        let text = `There are ${wrongUidSlides.length} presentations with incorrect Uids:\n`;
        for (const slidesWithPath of wrongUidSlides) {
            text += `\n${path.parse(slidesWithPath.path).name}\n${formatSlide(slidesWithPath.slides)}\n`;
        }
        await openPopup({
            text,
            heading: "Error",
            answer: true,
        });
    }

    const duplicatedUidSlides = getAllDuplicatedUidSlides(presentations);
    const nrOfDuplicatedUidSlides = Object.keys(duplicatedUidSlides).length;

    if (nrOfDuplicatedUidSlides > 0) {
        let text = `There are ${nrOfDuplicatedUidSlides} slides with duplicated Uids:\n`;
        for (const uid in duplicatedUidSlides) {
            if (Object.prototype.hasOwnProperty.call(duplicatedUidSlides, uid)) {
                text += `UID:${uid}`;
                for (const slide of duplicatedUidSlides[uid]) {
                    text += `\n${path.parse(slide.path).name}\n${formatSlide([slide.slide])}\n`;
                }
            }
        }

        openPopup({
            text,
            heading: "Error",
        });
    }
}
