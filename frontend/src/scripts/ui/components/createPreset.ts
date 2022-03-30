import fsBase from "fs";

import { Presentation } from "../../interfaces/presentation";
import { Placeholder, Preset, PresetSection } from "../../interfaces/preset";

const fs = fsBase.promises;

/**
 * This function will create a preset .json file. It contains all the UIDs from the selected and not selected
 * slides and all placeholders on these slides.
 * @param savePath The path where the .json will be saved
 * @param presetPresentations An Array of Presentations that will be used to create a preset.
 * @param presetPlaceholders An Array of Placeholders that will be used to create a preset.
 */
export default async function createPreset(
    savePath: string,
    presetPresentations: Presentation[],
    presetPlaceholders: Placeholder[],
) {
    const preset: Preset = {
        path: savePath,
        sections: [],
        placeholders: [],
    };

    for (const presentation of presetPresentations) {
        for (const section of presentation.Sections) {
            const presetSection: PresetSection = {
                name: section.Name,
                includedSlides: [],
                ignoredSlides: [],
            };
            for (const slide of section.Slides) {
                if (slide.IsSelected) {
                    presetSection.includedSlides.push(slide.Uid);
                } else {
                    presetSection.ignoredSlides.push(slide.Uid);
                }
            }
            if (presetSection.includedSlides.length > 0) {
                preset.sections.push(presetSection);
            }
        }
    }

    if (presetPlaceholders.length > 0) {
        preset.placeholders = presetPlaceholders;
    }

    const presetJson = JSON.stringify(preset, null, "\t");
    await fs.writeFile(savePath, presetJson);
}
