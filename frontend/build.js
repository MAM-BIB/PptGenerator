/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

const packager = require("electron-packager");
const copyfiles = require("copyfiles");

async function bundleElectronApp(options) {
    const appPaths = await packager(options);
    console.log(`Electron app bundles created:\n${appPaths.join("\n")}`);
}

bundleElectronApp({
    dir: "./build",
    out: "../dist",
});
