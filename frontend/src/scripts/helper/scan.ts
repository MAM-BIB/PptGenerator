import path from "path";
import fsBase from "fs";
import { exec } from "child_process";

import { getConfig } from "./config";
import openPopup from "./openPopup";
import { Presentation, Slide } from "../interfaces/presentation";
import { UidsWithSlides, SlidesWithPath } from "../interfaces/container";
import call from "./systemcall";
import reload from "./reload";
import duplicatedUidWindow from "./openDuplicatedUidWindow";

const fs = fsBase.promises;

/**
 * This function scans all .pptx files that are set in the settings.
 * @param focusedWindow The window where the loading animation will be displayed.
 */
export default async function scanPresentations(focusedWindow: Electron.BrowserWindow | null | undefined) {
    // start the loading animation.
    focusedWindow?.webContents.send("startLoading");

    // call the core application to scan the .pptx files.
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
        // open a PopUp when the task failed.
        await openPopup({
            text: `The process exited with errors!\n${error}`,
            heading: "Error",
            answer: true,
        });
    }
    // Reload the window to display the Data of the Presentations.
    reload(focusedWindow);

    // Check the UIds of the presentation for errors and scan again if the program changed uids.
    const scanAgain = !(await checkUids());
    if (scanAgain) {
        scanPresentations(focusedWindow);
    } else {
        // call: .\picsText.ps1 C:\Users\bib\GIT\PptGenerator\backend\slides\All_slides_EN_small.pptx 41
        // C:\Users\bib\GIT\PptGenerator\meta\pics\

        try {
            const presentationsJson = await fs.readFile(getConfig().metaJsonPath, { encoding: "utf-8" });
            const presentations = JSON.parse(presentationsJson) as Presentation[];

            for (let index = 0; index < presentations.length; index++) {
                const presentation = presentations[index];
                // eslint-disable-next-line no-await-in-loop
                await generatePics(presentation, index.toString());
            }
        } catch (error) {
            await openPopup({ text: `Could not create images!\n ${error}`, heading: "Error", answer: true });
        }
    }
}

/**
 * Generates pics for a presentation in the meta pic folder
 * @param presentation The presentation
 * @param folder The destination folder in the meta pics folder
 */
async function generatePics(presentation: Presentation, folder: string): Promise<void> {
    const nrOfSlides = presentation.Sections.reduce((sum, sec) => sum + sec.Slides.length, 0);
    if (nrOfSlides > 0) {
        const destPath = path.join(getConfig().metaPicsPath, folder);

        if (fsBase.existsSync(destPath)) {
            await fs.rm(destPath, { recursive: true });
        }

        await fs.mkdir(destPath);

        return new Promise<void>((resolve, reject) => {
            exec(
                `${path.resolve(getConfig().picsApplication)} "${path.resolve(
                    presentation.Path,
                )}" ${nrOfSlides.toString()} "${path.resolve(destPath)}"`,
                { shell: "powershell.exe" },
                (error) => {
                    if (error) reject(error.message);
                },
            ).on("exit", (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject("Program exited with unknown errors");
                }
            });
        });

        // await call(path.normalize(getConfig().picsApplication), [
        //     path.normalize(presentation.Path),
        //     nrOfSlides.toString(),
        //     path.normalize(destPath),
        // ]);
    }
    return new Promise<void>((resolve) => {
        resolve();
    });
}

/**
 * This function will format a slide to display the information in a PopUp.
 * @param slides The slides that will be formatted.
 * @returns A string with the data of the slide.
 */
export function formatSlide(slides: Slide[]): string {
    return slides
        .map((slide) => ` - Slide ${slide.Position + 1}: ${slide.Title || "No Title"} (UID:${slide.Uid})`)
        .join("\n");
}

/**
 * This function will get all duplicated UIDs from all scanned presentations.
 * @param presentations The presentations from which the uids will be taken.
 * @returns An object that functions like a HashWith the Uids of the slides and the path with the presentation.
 */
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

/**
 * This function will get all the incorrect UIDs from all scanned presentations.
 * @param presentations The presentations from which the uids will be taken.
 * @returns An object that functions like a HashWith the Uids of the slides and the path with the presentation.
 */
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

/**
 * This function check the UIDs for all presentations that were scanned.
 * @returns A boolean promise thats false if the program changed uids.
 */
export async function checkUids(): Promise<boolean> {
    const presentationsJson = await fs.readFile(getConfig().metaJsonPath, { encoding: "utf-8" });
    const presentations: Presentation[] = JSON.parse(presentationsJson) as Presentation[];

    const wrongUidSlides = getAllWrongUidSlides(presentations);
    if (wrongUidSlides.length > 0) {
        let text: string;
        if (wrongUidSlides.length === 1) {
            text = `There is ${wrongUidSlides.length} presentation with incorrect Uids:\n`;
        } else {
            text = `There are ${wrongUidSlides.length} presentations with incorrect Uids:\n`;
        }
        for (const slidesWithPath of wrongUidSlides) {
            text += `\n${path.parse(slidesWithPath.path).name}\n${formatSlide(slidesWithPath.slides)}\n`;
        }
        const answer = await openPopup({
            text,
            heading: "Error",
            primaryButton: "Set UIDs",
            primaryTooltip: "Generate UIDs for the slides automatically",
            secondaryButton: "Cancel",
            secondaryTooltip: "Close Window and add UIDs manually",
            answer: true,
        });

        // if the user wants the program to generate UIDs for slides with wrong uids
        if (answer) {
            // get all existing UIDs
            const existingUids = presentations
                .flatMap((presentation) => presentation.Sections)
                .flatMap((section) => section.Slides)
                .map((slide) => slide.Uid);
            // informs the user about a backup
            await openPopup({
                text: `Backup will be created at: ${getConfig().backupPath}`,
                heading: "Info",
                answer: true,
            });

            try {
                // calling a function to update all wrong UIDs
                for (const slidesWithPath of wrongUidSlides) {
                    // eslint-disable-next-line no-await-in-loop
                    await updateUIDs(slidesWithPath, existingUids);
                }
            } catch (error) {
                // popup if the core application failed
                await openPopup({
                    text: `The process exited with errors!\n${error}`,
                    heading: "Error",
                    answer: true,
                });
            }
            return false;
        }
    }

    const duplicatedUidSlides = getAllDuplicatedUidSlides(presentations);
    const nrOfDuplicatedUidSlides = Object.keys(duplicatedUidSlides).length;

    if (nrOfDuplicatedUidSlides > 0) {
        return !(await duplicatedUidWindow({
            uid: duplicatedUidSlides,
            existingUids: presentations
                .flatMap((presentation) => presentation.Sections)
                .flatMap((section) => section.Slides)
                .map((slide) => slide.Uid),
            answer: true,
        }));
    }

    return true;
}

/**
 * This function updates all necessary UIDs of a presentation. Before changing the UIDs
 * a backup will be created in the backup path from the config.json.
 * @param slidesWithPath The presentations and slides that need to get new UIDs.
 * @param existingUids All the UIDs that already exist.
 */
async function updateUIDs(slidesWithPath: SlidesWithPath, existingUids: string[]) {
    // creating a backup before changing the presentation
    await fs.copyFile(slidesWithPath.path, path.join(getConfig().backupPath, path.basename(slidesWithPath.path)));

    // calling the core application
    await call(getConfig().coreApplication, [
        "-mode",
        "addUid",
        "-inPath",
        slidesWithPath.path,
        "-slidePos",
        slidesWithPath.slides.map((slide) => slide.Position).join(","),
        "-existingUids",
        ...existingUids,
    ]);
}
