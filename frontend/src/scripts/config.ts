import fs from "fs";

import { Config } from "./interfaces/interfaces";

const configPath = "./config/config.json";
let config: Config;

export function getConfig(): Config {
    if (config) return config;

    const configJson = fs.readFileSync(configPath, { encoding: "utf-8" });
    config = JSON.parse(configJson) as Config;

    return config;
}

export function setConfig(newConfig: Config) {
    const json = JSON.stringify(newConfig, null, "\t");
    fs.writeFileSync(configPath, json);
}
