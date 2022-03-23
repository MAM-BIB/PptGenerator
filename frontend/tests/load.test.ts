import fs from "fs";
import path from "path";

import LoadFile from "../src/scripts/helper/loadFile";
import SectionElement from "../src/scripts/ui/components/sectionElement";
import { Slide, Section, Presentation, Preset, PresetSection, Placeholder } from "../src/scripts/interfaces/interfaces";
const meta2Path = "./tests/files/meta2.json";
const tmpPath = "./tests/files/tmp";

const slide1: Slide = {
    Title: "Test1",
    Uid: "4321Test1",
    RelationshipId: "RelationshipId",
    Position: 42,
    IsHidden: false,
    IsSelected: false,
    Placeholders: [],
};

const slide2: Slide = {
    Title: "Test2",
    Uid: "4321Test2",
    RelationshipId: "RelationshipId2",
    Position: 43,
    IsHidden: false,
    IsSelected: false,
    Placeholders: ["name"],
};

const section4: Section = {
    Name: "TestName1",
    Slides: [slide1, slide2],
};

const presetSection1: PresetSection = {
    name: "TestName1",
    includedSlides: ["4321Test1"],
    ignoredSlides: ["4321Test2"],
};

const placeholder: Placeholder = {
    name: "name",
    value: "max",
};

const preset1: Preset = {
    path: "C:/TestPath/test.json",
    sections: [presetSection1],
    placeholders: [placeholder],
};

const preset2: Preset = {
    path: "C:/TestPath/test2.json",
    sections: [presetSection1],
    placeholders: [],
};

const sectionElement1 = new SectionElement(section4);

const slide3: Slide = {
    RelationshipId: "rId2",
    Uid: "Test1234Test1234Test42",
    Position: 0,
    IsHidden: false,
    IsSelected: false,
    Title: "TestSlide 1.5",
    Placeholders: ["Name"],
};

const slide4: Slide = {
    RelationshipId: "rId3",
    Uid: "Test1234Test1234Test42",
    Position: 1,
    IsHidden: false,
    IsSelected: false,
    Title: "TestSlide 2.5",
    Placeholders: [],
};

const slide5: Slide = {
    RelationshipId: "rId4",
    Uid: "1234567890123456789042",
    Position: 2,
    IsHidden: false,
    IsSelected: false,
    Title: "Test~$Space$~Slide 3.5",
    Placeholders: ["Space"],
};

const section1: Section = {
    Name: "Section 1",
    Slides: [slide3],
};

const section2: Section = {
    Name: "Section 2",
    Slides: [slide4],
};

const section3: Section = {
    Name: "Section 3",
    Slides: [slide5],
};

const presentation: Presentation = {
    Path: "./tests/files/presentation2.pptx",
    Sections: [section1, section2, section3],
};

const sectionElement2 = new SectionElement(section1);
const sectionElement3 = new SectionElement(section2);
const sectionElement4 = new SectionElement(section3);

const sectionElements2 = [sectionElement2, sectionElement3, sectionElement4];

function clearTmpFolder() {
    if (fs.existsSync(tmpPath)) {
        if (fs.readdirSync(tmpPath).length) {
            fs.rmSync(tmpPath, { recursive: true });
        }
    }
    fs.mkdirSync(tmpPath, { recursive: true });
}

beforeEach(() => {
    clearTmpFolder();
});

afterAll(() => {
    clearTmpFolder();
});

test("selected json file is not a preset", () => {
    expect.assertions(1);
    const sectionElements = [sectionElement1];
    const file = new LoadFile(sectionElements);
    file.loadedPreset = {} as Preset;
    const expectedError = new Error("selected file is not a preset");
    try {
        file.loadPresetFromJson();
    } catch (e) {
        expect(e).toEqual(expectedError);
    }
});

test("selected preset saves placeholders when present", () => {
    const sectionElements = [sectionElement1];
    const file = new LoadFile(sectionElements);
    file.loadedPreset = preset1;
    const expectedPlaceholders = [placeholder];
    file.loadPresetFromJson();
    expect(file.placeholders).toEqual(expectedPlaceholders);
});

test("selected preset saves doesn't save placeholders when not present", () => {
    const sectionElements = [sectionElement1];
    const file = new LoadFile(sectionElements);
    file.loadedPreset = preset2;
    const expectedPlaceholders = [] as Placeholder[];
    file.loadPresetFromJson();
    expect(file.placeholders).toEqual(expectedPlaceholders);
});

test("selected preset only selects included slides", () => {
    const sectionElements = [sectionElement1];
    const file = new LoadFile(sectionElements);
    sectionElements[0].slides[0].select();
    const expectedSectionElements = sectionElements;
    file.loadedPreset = preset1;
    file.loadPresetFromJson();
    expect(file.sectionElements).toEqual(expectedSectionElements);
});

test("selected pptx only select all slides", () => {
    fs.copyFileSync(meta2Path, "./tests/tmp");

    const sectionElements = sectionElements2;
    const file = new LoadFile(sectionElements);
    sectionElements[0].slides[0].select();
    sectionElements[1].slides[0].select();
    sectionElements[2].slides[0].select();
    const expectedSectionElements = sectionElements;
    file.loadPresetFromMeta(path.join(tmpPath, "meta2.json"));
    expect(file.sectionElements).toEqual(expectedSectionElements);
});
