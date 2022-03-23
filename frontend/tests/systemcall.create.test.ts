import fs from "fs";
import path from "path";
import { getConfig } from "../src/scripts/config";
import call from "../src/scripts/helper/systemcall";
import { Presentation } from "../src/scripts/interfaces/interfaces";

const presentation1Path = "./tests/files/presentation1.pptx";
const presentation2Path = "./tests/files/presentation2.pptx";
const presentation3Path = "./tests/files/presentation3.pptx";
const baseMetaPath = "./tests/files/base-meta.json";

const meta1Path = "./tests/files/meta1.json";
const meta2Path = "./tests/files/meta2.json";
const meta3Path = "./tests/files/meta3.json";

const out1Path = "./tests/files/out1.pptx";

const tmpPath = "./tests/files/tmp";
const basePath = "./tests/files/base.pptx";

function clearTmpFolder() {
    if (fs.existsSync(tmpPath)) {
        if (fs.readdirSync(tmpPath).length) {
            fs.rmSync(tmpPath, { recursive: true });
        }
    }
    fs.mkdirSync(tmpPath, { recursive: true });
}

async function scan(inPath: string) {
    const metaPath = path.join(tmpPath, "tmpMeta.json");

    await call(getConfig().coreApplication, ["-inPath", inPath, "-outPath", metaPath]);

    const obj = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    fs.rmSync(metaPath);
    return obj;
}

beforeEach(() => {
    clearTmpFolder();
});

// Incorrect calls
test("call core with no arguments", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-mode", "create"]);
    } catch (e) {
        expect(e).toMatch("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
    }
});

test("call core with no arguments", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-mode", "create"]);
    } catch (e) {
        expect(e).toMatch("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
    }
});

test("call create with no slidePos", async () => {
    expect.assertions(1);

    const outPath = path.join(tmpPath, "/out.pptx");

    try {
        await call(getConfig().coreApplication, ["-mode", "create", "-outPath", outPath, "-inPath", presentation1Path]);
    } catch (e) {
        expect(e).toMatch(
            "'-slidePos' is not given. Invoke the program with the argument '-slidePos <slidePos,slidePos,...>'",
        );
    }
});

test("call create with only slidePos", async () => {
    expect.assertions(1);

    const outPath = path.join(tmpPath, "/out.pptx");

    try {
        await call(getConfig().coreApplication, [
            "-mode",
            "create",
            "-outPath",
            outPath,
            "-inPath",
            presentation1Path,
            "-slidePos",
        ]);
    } catch (e) {
        expect(e).toMatch(
            "'-slidePos' is not given. Invoke the program with the argument '-slidePos <slidePos,slidePos,...>'",
        );
    }
});

test("call create with wrong slidePos", async () => {
    expect.assertions(1);

    const outPath = path.join(tmpPath, "/out.pptx");

    try {
        await call(getConfig().coreApplication, [
            "-mode",
            "create",
            "-outPath",
            outPath,
            "-inPath",
            presentation1Path,
            "-basePath",
            basePath,
            "-slidePos",
            "1212",
        ]);
    } catch (e) {
        expect(e).toMatch("Specified argument was out of the range of valid values. (Parameter 'copiedSlideIndex')");
    }
});

test("call create and check slidePos", async () => {
    const outPath = path.join(tmpPath, "/out.pptx");

    await call(getConfig().coreApplication, [
        "-mode",
        "create",
        "-outPath",
        outPath,
        "-inPath",
        presentation1Path,
        "-basePath",
        basePath,
        "-slidePos",
        "1",
    ]);

    expect(fs.existsSync(outPath)).toBe(true);
});

test("call create with two presentations and check pptx", async () => {
    const outPath = path.join(tmpPath, "out.pptx");

    await call(getConfig().coreApplication, [
        "-mode",
        "create",
        "-outPath",
        outPath,
        "-inPath",
        presentation1Path,
        "-basePath",
        basePath,
        "-slidePos",
        "0",
    ]);

    await call(getConfig().coreApplication, [
        "-mode",
        "create",
        "-outPath",
        outPath,
        "-inPath",
        presentation2Path,
        "-slidePos",
        "2",
    ]);

    const outMetaJson = (await scan(outPath)) as Presentation[];

    const expectedBaseMetaJson = JSON.parse(fs.readFileSync(baseMetaPath, { encoding: "utf-8" })) as Presentation[];
    const expectedMeta1Json = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" })) as Presentation[];
    const expectedMeta2Json = JSON.parse(fs.readFileSync(meta2Path, { encoding: "utf-8" })) as Presentation[];

    const expectedSlides = [
        expectedBaseMetaJson[0].Sections[0].Slides[0],
        expectedMeta1Json[0].Sections[0].Slides[0],
        expectedMeta2Json[0].Sections[2].Slides[0],
    ];
    for (let index = 0; index < expectedSlides.length; index++) {
        const slide = expectedSlides[index];
        slide.RelationshipId = "";
        slide.Position = index;
    }

    const actualSlides = outMetaJson[0].Sections[0].Slides;
    for (const slide of actualSlides) {
        slide.RelationshipId = "";
    }

    expect(actualSlides).toEqual(expectedSlides);
});

test("call create with two presentations and -deleteFirstSlide then check pptx", async () => {
    const outPath = path.join(tmpPath, "out.pptx");

    await call(getConfig().coreApplication, [
        "-mode",
        "create",
        "-outPath",
        outPath,
        "-inPath",
        presentation1Path,
        "-basePath",
        basePath,
        "-slidePos",
        "0",
        "-deleteFirstSlide",
    ]);

    await call(getConfig().coreApplication, [
        "-mode",
        "create",
        "-outPath",
        outPath,
        "-inPath",
        presentation2Path,
        "-slidePos",
        "2",
    ]);

    const outMetaJson = (await scan(outPath)) as Presentation[];

    const expectedMeta1Json = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" })) as Presentation[];
    const expectedMeta2Json = JSON.parse(fs.readFileSync(meta2Path, { encoding: "utf-8" })) as Presentation[];

    const expectedSlides = [expectedMeta1Json[0].Sections[0].Slides[0], expectedMeta2Json[0].Sections[2].Slides[0]];
    for (let index = 0; index < expectedSlides.length; index++) {
        const slide = expectedSlides[index];
        slide.RelationshipId = "";
        slide.Position = index;
    }

    const actualSlides = outMetaJson[0].Sections[0].Slides;
    for (const slide of actualSlides) {
        slide.RelationshipId = "";
    }

    expect(actualSlides).toEqual(expectedSlides);
});

test("call create with placeholders in title then check pptx", async () => {
    const outPath = path.join(tmpPath, "out.pptx");

    await call(getConfig().coreApplication, [
        "-mode",
        "create",
        "-outPath",
        outPath,
        "-inPath",
        presentation2Path,
        "-basePath",
        basePath,
        "-slidePos",
        "2",
        "-deleteFirstSlide",
        "-placeholders",
        "Space, ",
    ]);

    const outMetaJson = (await scan(outPath)) as Presentation[];

    const expectedMeta2Json = JSON.parse(fs.readFileSync(meta2Path, { encoding: "utf-8" })) as Presentation[];

    const expectedSlides = [expectedMeta2Json[0].Sections[2].Slides[0]];
    expectedSlides[0].RelationshipId = "";
    expectedSlides[0].Position = 0;
    expectedSlides[0].Title = "Test Slide 3.5";
    expectedSlides[0].Placeholders = [];

    const actualSlides = outMetaJson[0].Sections[0].Slides;
    for (const slide of actualSlides) {
        slide.RelationshipId = "";
    }

    expect(actualSlides).toEqual(expectedSlides);
});
