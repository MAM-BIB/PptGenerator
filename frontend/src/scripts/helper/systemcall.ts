import { spawn } from "child_process";
import fs from "fs";

export default async function call(path: string, args: string[]) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(`Some important files are missing!\n${path}`);
        }

        const errors: string[] = [];
        const child = spawn(path, args);

        child.on("error", (error) => {
            reject(error.message);
        });

        child.stderr.on("data", async (d) => {
            errors.push(`${errors.length + 1}: ${d.toString()}`);
        });

        child.on("exit", async (code) => {
            if (code !== 0) {
                reject(errors.join("\n\n"));
            } else {
                resolve(true);
            }
        });
    });
}
