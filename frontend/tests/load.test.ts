import LoadFile from "../src/scripts/helper/loadFile";
import SectionElement from "../src/scripts/ui/components/sectionElement";
import { Slide, Section, Presentation, Preset, PresetSection, Placeholder } from "../src/scripts/interfaces/interfaces";

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

const slide3: Slide = {
    Title: "Test3",
    Uid: "4321Test3",
    RelationshipId: "RelationshipId3",
    Position: 44,
    IsHidden: false,
    IsSelected: false,
    Placeholders: [],
};

const slide4: Slide = {
    Title: "Test4",
    Uid: "4321Test4",
    RelationshipId: "RelationshipId4",
    Position: 45,
    IsHidden: false,
    IsSelected: false,
    Placeholders: [],
};

const section1: Section = {
    Name: "TestName1",
    Slides: [slide1, slide2],
};

const section2: Section = {
    Name: "TestName2",
    Slides: [slide3, slide4],
};

const presentation: Presentation = {
    Path: "C:/TestPath/test.pptx",
    Sections: [section1, section2],
};

const presetSection1: PresetSection = {
    name: "TestName1",
    includedSlides: ["4321Test1"],
    ignoredSlides: ["4321Test2"],
};

const presetSection3: PresetSection = {
    name: "TestName3",
    includedSlides: ["4321Test1", "4321Test2"],
    ignoredSlides: [],
};

const presetSection2: PresetSection = {
    name: "TestName2",
    includedSlides: [],
    ignoredSlides: ["4321Test3", "4321Test4"],
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

const sectionElement1 = new SectionElement(section1);
const sectionElement2 = new SectionElement(section1);

test("selected file is not a preset", () => {
    expect.assertions(1);
    const sectionElements = [sectionElement1];
    const file = new LoadFile(sectionElements);
    file.loadedPreset = {} as Preset;
    const expectedError = new Error("selected file is not a preset");
    try {
        file.loadPreset();
    } catch (e) {
        expect(e).toEqual(expectedError);
    }
});
