const fs = require("fs");
const path = require("path");

const SCORE_FOLDER = path.join(__dirname, "../../score");
const OUTPUT_FILE = path.join(SCORE_FOLDER, "finalRanking.json");

// Read all score files
function getScoreFiles() {
    if (!fs.existsSync(SCORE_FOLDER)) return [];

    return fs.readdirSync(SCORE_FOLDER)
        .filter(file => file.endsWith(".json"))
        .map(file => path.join(SCORE_FOLDER, file));
}

// Load JSON safely
function loadJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
        return null;
    }
}

// MAIN FUNCTION
async function generateRanking() {
    const files = getScoreFiles();

    const candidates = [];

    for (const file of files) {
        const data = loadJSON(file);

        if (data && typeof data.totalScore === "number") {
            candidates.push({
                filename: data.filename,
                totalScore: data.totalScore,
                breakdown: data.breakdown
            });
        }
    }

    // Sort by score
    candidates.sort((a, b) => b.totalScore - a.totalScore);

    // Add rank
    const ranked = candidates.map((c, index) => ({
        rank: index + 1,
        ...c
    }));

    // Save final ranking file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(ranked, null, 2));

    return ranked;
}

module.exports = generateRanking;