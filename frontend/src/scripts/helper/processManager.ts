import { execSync } from "child_process";

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

    if (execSync(cmd, { encoding: "utf-8" }).toLocaleLowerCase().search(lowerQuery) !== -1) {
        foundProcess = true;
    }

    return foundProcess;
}

export function killPpt(): number {
    const { platform } = process;
    let cmd: string;
    switch (platform) {
        case "win32":
            cmd = "taskkill -IM POWERPNT.EXE -F";
            break;
        case "darwin":
            // experimental
            cmd = "pkill -f POWERPNT.EXE";
            break;
        case "linux":
            // experimental
            cmd = "killbyname POWERPNT.EXE";
            break;
        default:
            // when checking the process failed
            return -1;
    }
    execSync(cmd);
    return 1;
}

export function sleep(ms: number) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
}
