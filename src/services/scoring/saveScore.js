const fs = require("fs");
const path = require("path");

module.exports = function(result) {

    const scoreFolder = path.join(process.cwd(), "score");

    if (!fs.existsSync(scoreFolder)) {
        fs.mkdirSync(scoreFolder, { recursive: true });
    }

    // SAFE UNIQUE NAME (VERY IMPORTANT)
    const safeName = result.filename
        .replace(/\s+/g, "_")
        .replace(".pdf", "")
        .replace(".json", "");

    const filePath = path.join(scoreFolder, `${safeName}.json`);

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf8");
};