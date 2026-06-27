const fs = require("fs");
const path = require("path");
const { SCORE_DIR } = require("../../config/path");

function saveScore(result, runId) {
    const runFolder = path.join(SCORE_DIR, `${runId}-upload`);

    fs.mkdirSync(runFolder, { recursive: true });

    const safeName = (result.filename || "unknown")
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")
        .replace(/\.pdf|\.json/g, "");

    // 🚨 ONLY ONE LEVEL — NO upload folder anywhere
    const filePath = path.join(runFolder, `${safeName}.json`);

    console.log("WRITING FILE:", filePath);

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
}


module.exports = { saveScore };