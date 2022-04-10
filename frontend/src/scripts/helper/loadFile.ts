import fsBase from "fs";
import path from "path";
import os from "os";

import { getConfig } from "./config";
import { Presentation, Slide } from "../interfaces/presentation";
import { Placeholder, Preset } from "../interfaces/preset";
import SectionElement from "../ui/components/sectionElement";
import openPopup from "./openPopup";
import { formatSlide } from "./scan";
import call from "./systemcall";

const fs = fsBase.promises;

/**
 * This Class will be used to load a json or pptx File to select
 * slides from the presentationMaster
 */
export default class LoadFile {
    public placeholders: Placeholder[];
    public loadedPreset: Preset;
    public sectionElements: SectionElement[];

    constructor(sections: SectionElement[]) {
        this.sectionElements = sections;
        this.placeholders = [] as Placeholder[];
        this.loadedPreset = { path: "", sections: [], placeholders: [] };
    }

    /**
     * This function will check the fileType, reads the file and calls a function to
     * process the date from the file.
     * @param pathOfFile This is the src path of the file to load
     * @param fileType The type of the file. It can only be .json or .pptx
     */
    public async load(pathOfFile: string, fileType: string) {
        if (fileType === ".json") {
            const presetJson = await fs.readFile(pathOfFile, { encoding: "utf-8" });
            this.loadedPreset = JSON.parse(presetJson) as Preset;
            this.loadPresetFromJson();
        } else if (fileType === ".pptx") {
            const outPath = path.join(os.tmpdir(), `${path.basename(pathOfFile, ".pptx")}.tmp.json`);
            await call(getConfig().coreApplication, ["-inPath", pathOfFile, "-outPath", outPath]);
            const unknown = await this.loadPresetFromMeta(outPath);
            if (unknown) {
                let text = "";
                if (unknown.newSlides.length === 1) {
                    text += `There is a slide with an unknown uids:\n\n${formatSlide(unknown.newSlides)}\n`;
                } else if (unknown.newSlides.length > 1) {
                    text += `There are ${unknown.newSlides.length} slides with unknown uids:\n\n${formatSlide(
                        unknown.newSlides,
                    )}\n`;
                }
                if (unknown.hashChangedList.length === 1) {
                    text += `\nThere is a slide with different content:\n${formatSlide(unknown.hashChangedList)}\n`;
                } else if (unknown.hashChangedList.length > 1) {
                    text += `\nThere are ${
                        unknown.hashChangedList.length
                    } slides with different content:\n${formatSlide(unknown.hashChangedList)}\n`;
                }

                openPopup({ text, heading: "Warning" }, false);
            }
        }
    }

    /**
     * This functions reads a .json file and process it to select the saved slides from the preset.
     * If the format of the .json file is not correct, it will throw an error.
     */
    public loadPresetFromJson() {
        if (!this.loadedPreset.path || !this.loadedPreset.sections || !this.loadedPreset.placeholders) {
            throw new Error("selected file is not a preset");
        }
        // deselect all selected slides
        for (const sectionElement of this.sectionElements) {
            for (const slideElement of sectionElement.slides) {
                slideElement.deselect();
            }
        }

        // flatmap all included slides
        const includedSlides = this.loadedPreset.sections
            .flatMap((section) => section.includedSlides)
            .sort((a, b) => a.position - b.position);

        // go through every section
        for (const includedSlide of includedSlides) {
            for (const slideELement of this.sectionElements.flatMap((elem) => elem.slides)) {
                if (includedSlide.uid === slideELement.slide.Uid) {
                    slideELement.select();
                }
            }
        }

        // saves the placeholders in the preset.
        if (this.loadedPreset.placeholders.length > 0) {
            this.placeholders = this.loadedPreset.placeholders;
        }
    }

    /**
     * This Function reads a .json file which was temporally created to process the data of a .pptx file.
     * This data is used to select the slides that are in the loaded pptx.
     * @param jsonPath The path of the file where the data from the pptx file will be formatted as a .json file.
     * @returns undefined if all slides are already known or the meta path and presentation array
     */
    public async loadPresetFromMeta(
        jsonPath: string,
    ): Promise<{ jsonPath: string; newSlides: Slide[]; hashChangedList: Slide[] } | undefined> {
        const PresMetaJson = await fs.readFile(jsonPath, { encoding: "utf-8" });
        const presentations = JSON.parse(PresMetaJson) as Presentation[];

        const allSelectedSlides = presentations.flatMap((pres) => pres.Sections).flatMap((section) => section.Slides);
        const hashChangedList: Slide[] = [];
        const newSlides: Slide[] = [];

        for (const selectedSlide of allSelectedSlides) {
            let isInMaster = false;
            for (const slideELement of this.sectionElements.flatMap((elem) => elem.slides)) {
                if (selectedSlide.Uid === slideELement.slide.Uid) {
                    isInMaster = true;
                    if (selectedSlide.Hash !== slideELement.slide.Hash) {
                        if (!slideELement.slide.History || !slideELement.slide.History.includes(selectedSlide.Hash)) {
                            hashChangedList.push(selectedSlide);
                        }
                    }
                    slideELement.select();
                }
            }
            isInMaster = true;
            if (!isInMaster) {
                newSlides.push(selectedSlide);
            }
        }

        if (newSlides.length || hashChangedList.length) {
            return {
                jsonPath,
                newSlides,
                hashChangedList,
            };
        }
        await fs.rm(jsonPath);
        return undefined;
    }
}
