const fs = require("fs");
const path = require("path");
const { SCORE_DIR } = require("../config/path");

function generateRanking(runId) {
    const runFolder = path.join(SCORE_DIR, `${runId}-upload`);

    const files = fs.readdirSync(runFolder);

    const scores = files.map(file => {
        const data = fs.readFileSync(path.join(runFolder, file));
        return JSON.parse(data);
    });

    // sort example
    scores.sort((a, b) => (b.score || 0) - (a.score || 0));

    console.log("🏆 Ranking generated");
    return scores;
}

module.exports = generateRanking;