const packager = require("electron-packager");
const path = require("path");
const fs = require("fs");
const uglifyJs = require("uglify-js");
const archiver = require("archiver");

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
        icon: "./build/views/icons/pptLogo64x64.ico",
    });

    fs.mkdirSync("../dist/pptgenerator-win32-x64/config/presets", { recursive: true });
    fs.mkdirSync("../dist/pptgenerator-win32-x64/config/assets");
    fs.mkdirSync("../dist/pptgenerator-win32-x64/export");
    fs.mkdirSync("../dist/pptgenerator-win32-x64/meta/pics", { recursive: true });

    fs.copyFileSync("./packager/config.json", "../dist/pptgenerator-win32-x64/config/config.json");
    fs.copyFileSync("./packager/meta.json", "../dist/pptgenerator-win32-x64/meta/meta.json");
    fs.copyFileSync("./packager/base.pptx", "../dist/pptgenerator-win32-x64/config/assets/base.pptx");
    fs.copyFileSync("./packager/README.txt", "../dist/pptgenerator-win32-x64/README.txt");

    fs.cpSync("../backend/PptGenerator/bin/Release/netcoreapp3.1/", "../dist/pptgenerator-win32-x64/core/", {
        recursive: true,
    });

    minify("../dist/");

    const output = fs.createWriteStream("../dist/PptGenerator.zip");
    const archive = archiver("zip", {
        zlib: { level: 9 },
    });

    archive.pipe(output);

    archive.directory("../dist/pptgenerator-win32-x64/", "PptGenerator");

    archive.finalize();
})();

function minify(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            minify(path.join(dir, file.name));
        } else if (file.isFile && file.name.endsWith(".js")) {
            fs.writeFileSync(
                path.join(dir, file.name),
                uglifyJs.minify(fs.readFileSync(path.join(dir, file.name), "utf8")).code,
            );
        }
    }
}
