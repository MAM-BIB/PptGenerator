import fs from "fs";

const configPath = "./config/config.json";
let config: Config;

export interface PresentationMaster {
    lang: string;
    paths: string[];
}

export interface Config {
    metaJsonPath: string;
    metaPicsPath: string;
    coreApplication: string;
    presetPath: string;
    presentationMasters: PresentationMaster[];
}

export default function getConfig(): Config {
    if (config) return config;

    const configJson = fs.readFileSync(configPath, { encoding: "utf-8" });
    config = JSON.parse(configJson) as Config;
    console.log("read ConfigFile", config);

    return config;
}
