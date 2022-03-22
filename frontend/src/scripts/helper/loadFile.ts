import fsBase from "fs";
import path from "path";

import { getConfig } from "../config";
import { Placeholder, Presentation, Preset } from "../interfaces/interfaces";
import SectionElement from "../ui/components/sectionElement";
import call from "./systemcall";

const fs = fsBase.promises;

export default class LoadFile {
    public placeholders: Placeholder[] | undefined;
    public loadedPreset: Preset;
    public sectionElements: SectionElement[];

    constructor(sections: SectionElement[]) {
        this.sectionElements = sections;
        this.placeholders = [];
        this.loadedPreset = { path: "", sections: [], placeholders: [] };
    }

    public async load(filePath: Electron.OpenDialogReturnValue, fileType: string) {
        const pathOfFile = filePath.filePaths[0];
        if (fileType === ".json") {
            const presetJson = await fs.readFile(pathOfFile, { encoding: "utf-8" });
            this.loadedPreset = JSON.parse(presetJson) as Preset;
            this.loadPreset();
        } else if (fileType === ".pptx") {
            const outPath = `${path.join(getConfig().presetPath, path.basename(pathOfFile, ".pptx"))}.TMP.json`;
            await call(getConfig().coreApplication, ["-inPath", filePath.filePaths[0], "-outPath", outPath]);
            this.createPreset(outPath);
        }
    }

    public loadPreset() {
        // deselect all selected slides
        for (const sectionElement of this.sectionElements) {
            for (const slideElement of sectionElement.slides) {
                slideElement.deselect();
            }
        }
        // delete placeholders
        this.placeholders = undefined;

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
        if (this.loadedPreset.placeholders.length > 0) {
            this.placeholders = this.loadedPreset.placeholders;
        }
    }

    public async createPreset(jsonPath: string) {
        const PresMetaJson = await fs.readFile(jsonPath, { encoding: "utf-8" });
        const presMeta = JSON.parse(PresMetaJson) as Presentation[];
        const allSelectedSlides = presMeta.flatMap((pres) => pres.Sections).flatMap((section) => section.Slides);

        for (const slideELement of this.sectionElements.flatMap((elem) => elem.slides)) {
            if (allSelectedSlides.some((slide) => slide.Uid === slideELement.slide.Uid)) {
                slideELement.select();
            } else {
                slideELement.deselect();
            }
        }
        fs.rm(jsonPath);
    }
}
