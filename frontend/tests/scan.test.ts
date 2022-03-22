import { formatSlide, getAllDuplicatedUidSlides, getAllWrongUidSlides } from "../src/scripts/helper/scan";
import { Slide, Section, Presentation } from "../src/scripts/interfaces/interfaces";

const slide1: Slide = {
    Title: "Test",
    Uid: "4321Test",
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
    expect(formatSlide([slide1])).toBe(" - Slide 43: Test (UID:4321Test)");
});

test("formatting 2 slides", () => {
    expect(formatSlide([slide1, slide1])).toBe(" - Slide 43: Test (UID:4321Test)\n - Slide 43: Test (UID:4321Test)");
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

// getAllDuplicatedUidSlides
test("getAllDuplicatedUidSlides of empty array", () => {
    expect(getAllDuplicatedUidSlides([])).toEqual({});
});

test("getAllDuplicatedUidSlides with no duplicated uids", () => {
    const section: Section = {
        Name: "TestSection",
        Slides: [slide1, slideWithNoTitle, slideWithNoUid],
    };

    const presentation: Presentation = {
        Path: "C:/TestPath/test.pptx",
        Sections: [section],
    };
    expect(getAllDuplicatedUidSlides([presentation])).toEqual({});
});

test("getAllDuplicatedUidSlides with 1 duplicated uid in same presentation", () => {
    const section: Section = {
        Name: "TestSection",
        Slides: [slide1, slideWithNoTitle, slideWithNoUid, slide1],
    };

    const presentation: Presentation = {
        Path: "C:/TestPath/test.pptx",
        Sections: [section],
    };
    expect(getAllDuplicatedUidSlides([presentation])).toEqual({
        "4321Test": [
            {
                path: presentation.Path,
                slide: slide1,
            },
            {
                path: presentation.Path,
                slide: slide1,
            },
        ],
    });
});

test("getAllDuplicatedUidSlides with 1 duplicated uid in different presentation", () => {
    const section1: Section = {
        Name: "TestSection",
        Slides: [slideWithNoTitle, slide1],
    };

    const section2: Section = {
        Name: "TestSection",
        Slides: [slideWithNoUid, slide1],
    };

    const presentation1: Presentation = {
        Path: "C:/TestPath/test1.pptx",
        Sections: [section1],
    };

    const presentation2: Presentation = {
        Path: "C:/TestPath/test2.pptx",
        Sections: [section2],
    };

    expect(getAllDuplicatedUidSlides([presentation1, presentation2])).toEqual({
        "4321Test": [
            {
                path: presentation1.Path,
                slide: slide1,
            },
            {
                path: presentation2.Path,
                slide: slide1,
            },
        ],
    });
});
