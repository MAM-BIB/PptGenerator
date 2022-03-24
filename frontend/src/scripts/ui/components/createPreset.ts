import fsBase from "fs";

import { Presentation, Placeholder, Preset, PresetSection } from "../../interfaces/interfaces";

const fs = fsBase.promises;

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
