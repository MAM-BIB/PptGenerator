import fs from "fs";
import path from "path";

import { Presentation, Section, Slide } from "../src/scripts/interfaces/presentation";
import { Placeholder } from "../src/scripts/interfaces/preset";
import createPreset from "../src/scripts/ui/components/createPreset";
import { clearTmpFolder } from "./testHelper";

const tmpPath = "./tests/files/tmp";
const presetPath = path.join(tmpPath, "preset.json");

const slide1: Slide = {
    Title: "Test1",
    Uid: "4321Test1",
    RelationshipId: "RelationshipId",
    Position: 42,
    IsHidden: false,
    IsSelected: true,
    Placeholders: [],
    Hash: "",
};

const slide2: Slide = {
    Title: "Test2",
    Uid: "4321Test2",
    RelationshipId: "RelationshipId2",
    Position: 43,
    IsHidden: true,
    IsSelected: false,
    Placeholders: ["Name"],
    Hash: "",
};

const slide3: Slide = {
    Title: "Test3",
    Uid: "4321Test3",
    RelationshipId: "RelationshipId3",
    Position: 44,
    IsHidden: true,
    IsSelected: true,
    Placeholders: [],
    Hash: "",
};

const slide4: Slide = {
    Title: "Test4",
    Uid: "4321Test4",
    RelationshipId: "RelationshipId4",
    Position: 45,
    IsHidden: false,
    IsSelected: false,
    Placeholders: [],
    Hash: "",
};

const slide5: Slide = {
    Title: "Test5",
    Uid: "4321Test5",
    RelationshipId: "RelationshipId5",
    Position: 46,
    IsHidden: false,
    IsSelected: false,
    Placeholders: [],
    Hash: "",
};

const section1: Section = {
    Name: "TestSection1",
    Slides: [slide1, slide2],
};

const section2: Section = {
    Name: "TestSection2",
    Slides: [slide3, slide4],
};

const section3: Section = {
    Name: "TestSection2",
    Slides: [slide5],
};

const presentation1: Presentation = {
    Path: "C:/TestPath/test1.pptx",
    Sections: [section1, section2, section3],
};

const placeholder1: Placeholder = {
    name: "Name",
    value: "name",
};

const presentations: Presentation[] = [presentation1];
const placeholders1: Placeholder[] = [placeholder1];
const placeholders2: Placeholder[] = [];

beforeEach(() => {
    clearTmpFolder();
});

afterAll(() => {
    clearTmpFolder();
});

test("create a preset.json file", async () => {
    await createPreset(presetPath, presentations, placeholders1);
    expect(fs.existsSync(presetPath)).toBe(true);
});

test("create preset.json without placeholders", async () => {
    await createPreset(presetPath, presentations, placeholders2);
    const preset = await JSON.parse(fs.readFileSync(presetPath, { encoding: "utf-8" }));
    expect(preset).toEqual({
        path: presetPath,
        placeholders: [],
        sections: [
            { ignoredSlides: ["4321Test2"], includedSlides: ["4321Test1"], name: "TestSection1" },
            { ignoredSlides: ["4321Test4"], includedSlides: ["4321Test3"], name: "TestSection2" },
        ],
    });
});

test("create preset.json with placeholders", async () => {
    await createPreset(presetPath, presentations, placeholders1);
    const preset = await JSON.parse(fs.readFileSync(presetPath, { encoding: "utf-8" }));
    expect(preset).toEqual({
        path: presetPath,
        placeholders: [{ name: "Name", value: "name" }],
        sections: [
            {
                ignoredSlides: ["4321Test2"],
                includedSlides: ["4321Test1"],
                name: "TestSection1",
            },
            {
                ignoredSlides: ["4321Test4"],
                includedSlides: ["4321Test3"],
                name: "TestSection2",
            },
        ],
    });
});
