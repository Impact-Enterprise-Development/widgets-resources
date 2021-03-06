const { getVersionFilePaths, readVersionFiles } = require("./lib/readFile.js");
const { writeVersionFiles } = require("./lib/writeFile.js");

(() => {
    const paths = getVersionFilePaths();
    const files = readVersionFiles(paths);
    const versionNumbers = files.pkg.version.split(".");
    const majorNumber = Number(versionNumbers[0]) + 1;
    const majorVersion = majorNumber + "." + 0 + "." + 0;
    files.pkg.version = files.manifest.native.version = files.manifest.web.version = majorVersion;
    writeVersionFiles(files, paths);
})();
