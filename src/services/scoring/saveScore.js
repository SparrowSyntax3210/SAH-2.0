const fs = require("fs");
const path = require("path");

let cleared = false;

module.exports = function saveScore(result, runId = "default") {

    const SCORE_DIR = path.join(process.cwd(), "score");
    const runFolder = path.join(SCORE_DIR, `${runId}-upload`);

    // Clear previous scores only once
    if (!cleared) {
        if (fs.existsSync(runFolder)) {
            fs.rmSync(runFolder, {
                recursive: true,
                force: true
            });
        }

        fs.mkdirSync(runFolder, { recursive: true });
        cleared = true;
    }

    // Extract only the filename (remove upload\ if present)
    let safeName = (result.filename || "unknown")
        .split(/[\\/]/)
        .pop();

    safeName = safeName
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")
        .replace(/\.pdf$/i, "");

    const filePath = path.join(runFolder, `${safeName}.json`);

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

    console.log("✅ Score saved:", filePath);
};