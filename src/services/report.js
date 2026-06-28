const fs = require("fs");
const path = require("path");

function saveResumeReport(filePath, text, parsedData, type = "candidate") {

    const dir = path.join(process.cwd(), "reports", type);

    fs.mkdirSync(dir, {
        recursive: true
    });

    const filename =
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2) +
        ".json";

    const fullPath = path.join(dir, filename);

    fs.writeFileSync(
        fullPath,
        JSON.stringify(
            {
                metadata: {
                    filename: filePath
                },
                text,
                parsedData
            },
            null,
            2
        )
    );

    console.log("✅ Report Saved:", filename);

    return fullPath;
}

module.exports = saveResumeReport;