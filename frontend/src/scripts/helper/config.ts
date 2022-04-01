import fs from "fs";

import { Config } from "../interfaces/config";

const configPath = "./config/config.json";
let config: Config;

/**
 * This Function returns a config object.
 * @returns A config object.
 */
export function getConfig(): Config {
    if (config) return config;

    return refreshConfig();
}

/**
 * This function overrides the config.json with passed object.
 * @param newConfig A config object.
 */
export function setConfig(newConfig: Config) {
    const json = JSON.stringify(newConfig, null, "\t");
    fs.writeFileSync(configPath, json);
}

/**
 * This functions reads from the config.json an creates a new config object based on the data.
 * @returns A config object.
 */
export function refreshConfig(): Config {
    const configJson = fs.readFileSync(configPath, { encoding: "utf-8" });
    config = JSON.parse(configJson) as Config;

    return config;
}
