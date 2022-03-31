import fsBase from "fs";
import path from "path";

import { getConfig } from "./config";
import { Presentation } from "../interfaces/presentation";
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
            const outPath = `${path.join(getConfig().presetPath, path.basename(pathOfFile, ".pptx"))}.TMP.json`;
            await call(getConfig().coreApplication, ["-inPath", pathOfFile, "-outPath", outPath]);
            const unknown = await this.loadPresetFromMeta(outPath);
            if (unknown) {
                let text = "";
                for (const section of unknown.presentations.flatMap((pres) => pres.Sections)) {
                    text += `\n${formatSlide(section.Slides)}\n`;
                }
                openPopup(
                    { text: `There are slides with uids, that are not known!\n${text}`, heading: "Warning" },
                    false,
                );
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

        // go through every section
        for (const section of this.loadedPreset.sections) {
            // go through every included slide
            for (const slideUID of section.includedSlides) {
                for (const sectionElement of this.sectionElements) {
                    for (const slideElement of sectionElement.slides) {
                        if (slideUID === slideElement.slide.Uid) {
                            slideElement.select();
                        }
                    }
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
    ): Promise<{ jsonPath: string; presentations: Presentation[] } | undefined> {
        const PresMetaJson = await fs.readFile(jsonPath, { encoding: "utf-8" });
        const presentations = JSON.parse(PresMetaJson) as Presentation[];
        const allSelectedSlides = presentations.flatMap((pres) => pres.Sections).flatMap((section) => section.Slides);

        for (const slideELement of this.sectionElements.flatMap((elem) => elem.slides)) {
            if (
                allSelectedSlides.some((slide) => {
                    if (slide.Uid === slideELement.slide.Uid) {
                        // eslint-disable-next-line no-param-reassign
                        slide.IsSelected = true;
                        return true;
                    }
                    return false;
                })
            ) {
                slideELement.select();
            } else {
                slideELement.deselect();
            }
        }

        for (const presentation of presentations) {
            for (const section of presentation.Sections) {
                section.Slides = section.Slides.filter((slide) => !slide.IsSelected);
            }
        }

        if (allSelectedSlides.some((slide) => !slide.IsSelected)) {
            return {
                jsonPath,
                presentations,
            };
        }
        await fs.rm(jsonPath);
        return undefined;
    }
}
