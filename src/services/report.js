const fs = require("fs");
const path = require("path");

async function saveResumeReport(filePath, rawText, parsedData, type = "candidate") {

    // reports folder
    const reportDir = path.join(
        process.cwd(),
        "reports",
        type
    );
    
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportFile = path.join(
        reportDir,
        `${path.parse(filePath).name}.json`
    );

    // Report structure
    const report = {

        metadata: {
            filename: path.basename(filePath),
            type,
            generatedAt: new Date().toISOString()
        },

        rawText,

        parsedData,

        analysis: {

            atsScore: null,

            tfidfSimilarity: null,

            cosineSimilarity: null,

            matchedSkills: [],

            missingSkills: [],

            strengths: [],

            weaknesses: [],

            recommendations: []

        }

    };

    fs.writeFileSync(
        reportFile,
        JSON.stringify(report, null, 4),
        "utf8"
    );

    return reportFile;
}

module.exports = {
    saveResumeReport
};