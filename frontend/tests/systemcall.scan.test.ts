import fs from "fs";
import path from "path";
import { getConfig } from "../src/scripts/config";
import call from "../src/scripts/helper/systemcall";
import { clearTmpFolder } from "./testHelper";

const presentation1Path = "./tests/files/presentation1.pptx";
const presentation2Path = "./tests/files/presentation2.pptx";
const presentation3Path = "./tests/files/presentation3.pptx";
const meta1Path = "./tests/files/meta1.json";
const meta2Path = "./tests/files/meta2.json";
const meta3Path = "./tests/files/meta3.json";
const baseMetaPath = "./tests/files/base-meta.json";
const tmpPath = "./tests/files/tmp";
const basePath = "./tests/files/base.pptx";

beforeEach(() => {
    clearTmpFolder();
});

afterAll(() => {
    clearTmpFolder();
});

// Incorrect calls
test("call core with no arguments", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, []);
    } catch (e) {
        expect(e).toMatch("No argument are given! Try '-help' to get a list of arguments.");
    }
});

test("call core help", async () => {
    await call(getConfig().coreApplication, ["-help"]);
});

test("call core with no only mode", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-mode"]);
    } catch (e) {
        expect(e).toMatch("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
    }
});

test("call core with no only mode scan", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-mode", "scan"]);
    } catch (e) {
        expect(e).toMatch("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
    }
});

test("call core with no only outPath", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-outPath"]);
    } catch (e) {
        expect(e).toMatch("'-outPath' is not given. Invoke the program with the argument '-outPath <path>'");
    }
});

test("call core with no only outPath test", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-outPath", "test"]);
    } catch (e) {
        expect(e).toMatch(
            "'-inPath' is not given. Invoke the program with the argument '-inPath <path> (<path>? ...)'",
        );
    }
});

test("call core with no outPath and only inPath", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-outPath", "test", "-inPath"]);
    } catch (e) {
        expect(e).toMatch(
            "'-inPath' is not given. Invoke the program with the argument '-inPath <path> (<path>? ...)'",
        );
    }
});

test("call core with wrong inPath", async () => {
    expect.assertions(1);
    try {
        await call(getConfig().coreApplication, ["-outPath", "test", "-inPath", "./test"]);
    } catch (e) {
        expect(e).toMatch("Could not find document");
    }
});

test("call core with wrong outPath", async () => {
    expect.assertions(1);

    const metaPath = path.join(tmpPath, "folderDoseNotExists/meta.json");

    try {
        await call(getConfig().coreApplication, ["-outPath", metaPath, "-inPath", presentation1Path]);
    } catch (e) {
        expect(e).toMatch(/Could not find a part of the path.*/);
    }
});

// Correct calls
test("call core with scan creates meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, ["-outPath", metaPath, "-inPath", presentation1Path]);

    expect(fs.existsSync(metaPath)).toBe(true);
});

test("call core with scan and changed argument order creates meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, ["-inPath", presentation1Path, "-outPath", metaPath]);

    expect(fs.existsSync(metaPath)).toBe(true);
});

test("scan presentation1 and check the meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, ["-inPath", presentation1Path, "-outPath", metaPath]);

    expect(fs.existsSync(metaPath)).toBe(true);

    const metaJson = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    const expectedMetaJson = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" }));

    expect(metaJson).toEqual(expectedMetaJson);
});

test("scan presentation2 and check the meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, ["-inPath", presentation2Path, "-outPath", metaPath]);

    expect(fs.existsSync(metaPath)).toBe(true);

    const metaJson = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    const expectedMetaJson = JSON.parse(fs.readFileSync(meta2Path, { encoding: "utf-8" }));

    expect(metaJson).toEqual(expectedMetaJson);
});

test("scan presentation3 and check the meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, ["-inPath", presentation3Path, "-outPath", metaPath]);

    expect(fs.existsSync(metaPath)).toBe(true);

    const metaJson = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    const expectedMetaJson = JSON.parse(fs.readFileSync(meta3Path, { encoding: "utf-8" }));

    expect(metaJson).toEqual(expectedMetaJson);
});

test("scan presentation 1 and 2 and check the meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, ["-inPath", presentation1Path, presentation2Path, "-outPath", metaPath]);

    expect(fs.existsSync(metaPath)).toBe(true);

    const metaJson = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    const expectedMeta1Json = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" })) as Array<any>;
    const expectedMeta2Json = JSON.parse(fs.readFileSync(meta2Path, { encoding: "utf-8" })) as Array<any>;

    expect(metaJson).toEqual(expectedMeta1Json.concat(expectedMeta2Json));
});

test("scan presentation 2 and 1 and check the meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, ["-inPath", presentation2Path, presentation1Path, "-outPath", metaPath]);

    expect(fs.existsSync(metaPath)).toBe(true);

    const metaJson = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    const expectedMeta1Json = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" })) as Array<any>;
    const expectedMeta2Json = JSON.parse(fs.readFileSync(meta2Path, { encoding: "utf-8" })) as Array<any>;

    expect(metaJson).toEqual(expectedMeta2Json.concat(expectedMeta1Json));
});

test("scan presentation 2, 3 and 1 and check the meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, [
        "-inPath",
        presentation2Path,
        presentation3Path,
        presentation1Path,
        "-outPath",
        metaPath,
    ]);

    expect(fs.existsSync(metaPath)).toBe(true);

    const metaJson = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    const expectedMeta1Json = JSON.parse(fs.readFileSync(meta1Path, { encoding: "utf-8" })) as Array<any>;
    const expectedMeta2Json = JSON.parse(fs.readFileSync(meta2Path, { encoding: "utf-8" })) as Array<any>;
    const expectedMeta3Json = JSON.parse(fs.readFileSync(meta3Path, { encoding: "utf-8" })) as Array<any>;

    expect(metaJson).toEqual(expectedMeta2Json.concat(expectedMeta3Json, expectedMeta1Json));
});

test("scan base presentation with hidden slide and check the meta-file", async () => {
    const metaPath = path.join(tmpPath, "meta.json");

    await call(getConfig().coreApplication, ["-inPath", basePath, "-outPath", metaPath]);

    expect(fs.existsSync(metaPath)).toBe(true);

    const metaJson = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    const expectedMetaJson = JSON.parse(fs.readFileSync(baseMetaPath, { encoding: "utf-8" }));

    expect(metaJson).toEqual(expectedMetaJson);
});
