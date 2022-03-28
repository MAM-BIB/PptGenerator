import fs from "fs";
import path from "path";
import { getConfig } from "../src/scripts/config";
import call from "../src/scripts/helper/systemcall";
import { Presentation } from "../src/scripts/interfaces/interfaces";
import { clearTmpFolder, scan } from "./testHelper";

const presentation1Path = "./tests/files/presentation1.pptx";
const presentation2Path = "./tests/files/presentation2.pptx";
const baseMetaPath = "./tests/files/base-meta.json";

const meta1Path = "./tests/files/meta1.json";
const meta2Path = "./tests/files/meta2.json";

const tmpPath = "./tests/files/tmp";
const basePath = "./tests/files/base.pptx";

beforeEach(() => {
    clearTmpFolder();
});

// Incorrect calls
test("call addUid with no arguments", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-mode", "addUid"]);
    } catch (e) {
        expect(e).toMatch(
            "'-inPath' is not given. Invoke the program with the argument '-inPath <path> (<path>? ...)'",
        );
    }
});

test("call addUid with only inPath", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-mode", "addUid", "-inPath", "presentation1Path"]);
    } catch (e) {
        expect(e).toMatch(
            "'-slidePos' is not given. Invoke the program with the argument '-slidePos <slidePos,slidePos,...>'",
        );
    }
});

// Correct calls
test("call addUid and check if only the uid changed", async () => {
    const cpPresentation1Path = path.join(tmpPath, "meta.json");
    fs.copyFileSync(presentation1Path, cpPresentation1Path);

    await call(getConfig().coreApplication, ["-mode", "addUid", "-inPath", cpPresentation1Path, "-slidePos", "0"]);

    const outMetaJson = (await scan(cpPresentation1Path)) as Presentation[];
    const expectedMeta1Json = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" })) as Presentation[];

    outMetaJson[0].Path = "";
    expectedMeta1Json[0].Path = "";

    outMetaJson[0].Sections[0].Slides[0].Uid = "";
    expectedMeta1Json[0].Sections[0].Slides[0].Uid = "";

    expect(outMetaJson).toEqual(expectedMeta1Json);
});

test("call addUid and check if the uid was added", async () => {
    const cpPresentation1Path = path.join(tmpPath, "meta.json");
    fs.copyFileSync(presentation1Path, cpPresentation1Path);

    await call(getConfig().coreApplication, ["-mode", "addUid", "-inPath", cpPresentation1Path, "-slidePos", "0"]);

    const outMetaJson = (await scan(cpPresentation1Path)) as Presentation[];
    const expectedMeta1Json = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" })) as Presentation[];

    expect(outMetaJson[0].Sections[0].Slides[0].Uid).not.toEqual(expectedMeta1Json[0].Sections[0].Slides[0].Uid);
});

test("call addUid and check if the uid was replaced", async () => {
    const cpPresentation1Path = path.join(tmpPath, "meta.json");
    fs.copyFileSync(presentation1Path, cpPresentation1Path);

    await call(getConfig().coreApplication, ["-mode", "addUid", "-inPath", cpPresentation1Path, "-slidePos", "1"]);

    const outMetaJson = (await scan(cpPresentation1Path)) as Presentation[];
    const expectedMeta1Json = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" })) as Presentation[];

    expect(outMetaJson[0].Sections[0].Slides[1].Uid).not.toEqual(expectedMeta1Json[0].Sections[0].Slides[1].Uid);
});
