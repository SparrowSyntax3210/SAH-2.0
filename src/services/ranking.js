const fs = require("fs");
const path = require("path");

const SCORE_FOLDER = path.join(process.cwd(), "score");

const OUTPUT_FILE = path.join(
    SCORE_FOLDER,
    "finalRanking.json"
);

function getScoreFiles(dir = SCORE_FOLDER) {

    let results = [];

    if (!fs.existsSync(dir))
        return results;

    const items = fs.readdirSync(dir);

    for (const item of items) {

        if (item === "finalRanking.json")
            continue;

        const full = path.join(dir, item);

        if (fs.statSync(full).isDirectory()) {
            results.push(...getScoreFiles(full));
        }
        else if (item.endsWith(".json")) {
            results.push(full);
        }

    }

    return results;

}

async function generateRanking() {

    const files = getScoreFiles();

    const candidates = [];

    for (const file of files) {

        const data = JSON.parse(
            fs.readFileSync(file, "utf8")
        );

        if (
            typeof data.totalScore !== "number"
        )
            continue;

        candidates.push({
            filename: data.filename,
            totalScore: data.totalScore,
            breakdown: data.breakdown
        });

    }

    candidates.sort(
        (a, b) => b.totalScore - a.totalScore
    );

    const ranking = candidates.map(
        (c, i) => ({
            rank: i + 1,
            ...c
        })
    );

    fs.writeFileSync(
        OUTPUT_FILE,
        JSON.stringify(ranking, null, 2)
    );

    console.log("✅ Ranking Generated");

    return ranking;

}

module.exports = generateRanking;