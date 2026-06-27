const fs = require("fs");
const path = require("path");

const SCORE_FOLDER = path.join(process.cwd(), "score");
const OUTPUT_FILE = path.join(SCORE_FOLDER, "finalRanking.json");

// ✅ recursive file collector (FIXED)
function getScoreFiles(dir = SCORE_FOLDER) {
    let results = [];

    if (!fs.existsSync(dir)) return results;

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(getScoreFiles(fullPath));
        } else if (item.endsWith(".json")) {
            results.push(fullPath);
        }
    }

    return results;
}

// safe JSON loader
function loadJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
        return null;
    }
}

// MAIN
async function generateRanking() {
    const files = getScoreFiles();

    const candidates = [];

    for (const file of files) {
        const data = loadJSON(file);

        if (!data) {
            console.log("SKIP (invalid json):", file);
            continue;
        }
        
        if (typeof data.totalScore !== "number") {
            console.log("SKIP (missing score):", file, data);
            continue;
        } {
            candidates.push({
                filename: data.filename,
                totalScore: data.totalScore,
                breakdown: data.breakdown
            });
        }
    }

    // sort descending
    candidates.sort((a, b) => b.totalScore - a.totalScore);

    // add rank
    const ranked = candidates.map((c, index) => ({
        rank: index + 1,
        ...c
    }));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(ranked, null, 2));

    return ranked;
}

module.exports = generateRanking;