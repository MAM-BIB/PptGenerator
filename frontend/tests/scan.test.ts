import { formatSlide, getAllWrongUidSlides } from "../src/scripts/helper/scan";
import { Slide, Section, Presentation } from "../src/scripts/interfaces/interfaces";

const slide1: Slide = {
    Title: "Test",
    Uid: "1234Test",
    RelationshipId: "RelationshipId",
    Position: 42,
    IsHidden: false,
    IsSelected: false,
    Placeholders: [],
};

const slideWithNoTitle: Slide = {
    Title: "",
    Uid: "1234Test",
    RelationshipId: "RelationshipId",
    Position: 42,
    IsHidden: false,
    IsSelected: false,
    Placeholders: [],
};

const slideWithNoUid: Slide = {
    Title: "TestWithoutUID",
    Uid: "",
    RelationshipId: "RelationshipId",
    Position: 42,
    IsHidden: false,
    IsSelected: false,
    Placeholders: [],
};

// formatSlide
test("formatting 1 slide", () => {
    expect(formatSlide([slide1])).toBe(" - Slide 43: Test (UID:1234Test)");
});

test("formatting 2 slides", () => {
    expect(formatSlide([slide1, slide1])).toBe(" - Slide 43: Test (UID:1234Test)\n - Slide 43: Test (UID:1234Test)");
});

test("formatting 1 slide with no title", () => {
    expect(formatSlide([slideWithNoTitle])).toBe(" - Slide 43: No Title (UID:1234Test)");
});

// getAllWrongUidSlides
test("getWrongUids of empty array", () => {
    expect(getAllWrongUidSlides([])).toEqual([]);
});

test("getWrongUids with one wrong slide", () => {
    const section: Section = {
        Name: "TestSection",
        Slides: [slide1, slideWithNoTitle, slideWithNoUid],
    };

    const presentation: Presentation = {
        Path: "C:/TestPath/test.pptx",
        Sections: [section],
    };
    expect(getAllWrongUidSlides([presentation])).toEqual([
        {
            path: presentation.Path,
            slides: [slideWithNoUid],
        },
    ]);
});

test("getWrongUids with no wrong slide", () => {
    const section: Section = {
        Name: "TestSection",
        Slides: [slide1, slideWithNoTitle, slide1],
    };

    const presentation: Presentation = {
        Path: "C:/TestPath/test.pptx",
        Sections: [section],
    };
    expect(getAllWrongUidSlides([presentation])).toEqual([]);
});
