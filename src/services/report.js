const fs = require("fs");
const path = require("path");

async function saveResumeReport(filePath, rawText, parsedData) {

    const reportDirectory = path.join(process.cwd(), "reports");

    if (!fs.existsSync(reportDirectory))
        fs.mkdirSync(reportDirectory);

    const reportFile = path.join(

        reportDirectory,

        `${path.parse(filePath).name}.json`

    );

    const report = {

        filename: path.basename(filePath),

        createdAt: new Date().toISOString(),

        parsedData

    };

    fs.writeFileSync(

        reportFile,

        JSON.stringify(report, null, 2),

        "utf8"

    );

    return reportFile;

}

module.exports = {
    saveResumeReport
};