import { execFileSync } from "child_process";

/**
 * This function is used to check if a process is running.
 * @param query The process to check.
 * @returns A boolean if the process is running.
 */
export default function isRunning(query: string): boolean | number {
    const { platform } = process;
    let cmd: string;
    let foundProcess = false;
    const lowerQuery = query.toLocaleLowerCase();
    switch (platform) {
        case "win32":
            cmd = "tasklist";
            break;
        case "darwin":
            // experimental
            cmd = "ps -ax";
            break;
        case "linux":
            // experimental
            cmd = "ps -A";
            break;
        default:
            // when checking the process failed
            return -1;
    }

    if (execFileSync(cmd, { encoding: "utf-8" }).toLocaleLowerCase().search(lowerQuery) !== -1) {
        foundProcess = true;
    }

    return foundProcess;
}
