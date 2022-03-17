const packager = require("electron-packager");
const fs = require("fs");

async function bundleElectronApp(options) {
    const appPaths = await packager(options);
    console.log(`Electron app bundles created:\n${appPaths.join("\n")}`);
    return;
}

(async function init() {
    fs.copyFileSync("./packager/package.json", "./build/package.json");

    await bundleElectronApp({
        dir: "./build",
        out: "../dist",
    });

    fs.mkdirSync("../dist/pptgenerator-win32-x64/config/presets", { recursive: true });
    fs.mkdirSync("../dist/pptgenerator-win32-x64/config/assets");
    fs.mkdirSync("../dist/pptgenerator-win32-x64/export");
    fs.mkdirSync("../dist/pptgenerator-win32-x64/meta/pics", { recursive: true });

    fs.copyFileSync("./packager/config.json", "../dist/pptgenerator-win32-x64/config/config.json");
    fs.copyFileSync("./packager/meta.json", "../dist/pptgenerator-win32-x64/meta/meta.json");
    fs.copyFileSync("./packager/base.pptx", "../dist/pptgenerator-win32-x64/config/assets/base.pptx");

    fs.cpSync("../backend/PptGenerator/bin/Release/netcoreapp3.1/", "../dist/pptgenerator-win32-x64/core/", {
        recursive: true,
    });
})();
