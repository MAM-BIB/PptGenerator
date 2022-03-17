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

    // minify("../dist/");
})();

function minify(dir) {
    const foundFiles = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.isDirectory()) {
            minify(file.name);
        } else {
            foundFiles.push(file);
        }
    }
    uglify(foundFiles);
}

function uglify(files) {
    for (const file of files) {
        if (path.extname(file) === ".js") {
            let options = {
                mangle: {
                    properties: true,
                },
                nameCache: JSON.parse(fs.readFileSync(file, "utf8")),
            };
            fs.writeFileSync(
                "part1.js",
                UglifyJS.minify(
                    {
                        "file1.js": fs.readFileSync("file1.js", "utf8"),
                        "file2.js": fs.readFileSync("file2.js", "utf8"),
                    },
                    options,
                ).code,
                "utf8",
            );
            fs.writeFileSync(
                "part2.js",
                UglifyJS.minify(
                    {
                        "file3.js": fs.readFileSync("file3.js", "utf8"),
                        "file4.js": fs.readFileSync("file4.js", "utf8"),
                    },
                    options,
                ).code,
                "utf8",
            );
            fs.writeFileSync(cacheFileName, JSON.stringify(options.nameCache), "utf8");
        }
    }
}
