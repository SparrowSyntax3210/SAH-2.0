const fs = require("fs");
const path = require("path");

module.exports = function saveScore(result, runId = "default") {

    const runFolder = path.join(
        process.cwd(),
        "score",
        `${runId}-upload`
    );

    fs.mkdirSync(runFolder, {
        recursive: true
    });

    let safeName = (result.filename || "unknown")
        .split(/[\\/]/)
        .pop();

    safeName = safeName
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")
        .replace(/\.pdf$/i, "");

    const filePath = path.join(
        runFolder,
        `${safeName}.json`
    );

    fs.writeFileSync(
        filePath,
        JSON.stringify(result, null, 2)
    );

    console.log("✅ Score Saved:", safeName);
};