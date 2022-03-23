import fs from "fs";

import { Config } from "./interfaces/interfaces";

const configPath = "./config/config.json";
export let config: Config;

export function getConfig(): Config {
    if (config) return config;

    return refreshConfig();
}

export function setConfig(newConfig: Config) {
    const json = JSON.stringify(newConfig, null, "\t");
    fs.writeFileSync(configPath, json);
}

export function refreshConfig(): Config {
    const configJson = fs.readFileSync(configPath, { encoding: "utf-8" });
    config = JSON.parse(configJson) as Config;

    return config;
}
