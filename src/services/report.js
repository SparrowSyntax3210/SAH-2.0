const fs = require("fs");
const path = require("path");

let cleared = false;

function saveResumeReport(filePath, text, parsedData, type = "candidate") {

    const dir = path.join(process.cwd(), "reports", type);

    // Clear only once
    if (!cleared) {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, {
                recursive: true,
                force: true
            });
        }

        fs.mkdirSync(dir, { recursive: true });
        cleared = true;
    }

    const filename =
        Date.now() + "-" + Math.random().toString(36).slice(2) + ".json";

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

    return fullPath;
}

module.exports = saveResumeReport;