import { ipcRenderer } from "electron";
import { spawn } from "child_process";

import getConfig from "../../config";

ipcRenderer.on("data", (event, data) => {
    console.log(data);

    const bat = spawn(getConfig().coreApplication, data);

    bat.stdout.on("data", (data) => {
        console.log(data.toString());
    });

    bat.stderr.on("data", (data) => {
        console.error(data.toString());
    });

    bat.on("exit", (code) => {
        console.log(`Child exited with code ${code}`);
    });
});
