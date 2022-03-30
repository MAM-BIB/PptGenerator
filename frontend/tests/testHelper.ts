import fs from "fs";
import path from "path";
import { getConfig } from "../src/scripts/helper/config";
import call from "../src/scripts/helper/systemcall";

const tmpPath = "./tests/files/tmp";

export function clearTmpFolder() {
    if (fs.existsSync(tmpPath)) {
        if (fs.readdirSync(tmpPath).length) {
            fs.rmSync(tmpPath, { recursive: true });
        }
    }
    fs.mkdirSync(tmpPath, { recursive: true });
}

export async function scan(inPath: string) {
    const metaPath = path.join(tmpPath, "tmpMeta.json");

    await call(getConfig().coreApplication, ["-inPath", inPath, "-outPath", metaPath]);

    const obj = JSON.parse(fs.readFileSync(metaPath, { encoding: "utf-8" }));
    fs.rmSync(metaPath);
    return obj;
}
