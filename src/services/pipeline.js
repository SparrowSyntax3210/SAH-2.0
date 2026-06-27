const scoreCandidateReports = require("./scoring");
const generateRanking = require("./ranking");

async function processPipeline() {
    const runId = Date.now();

    try {
        console.log("🔄 Pipeline started...");

        await scoreCandidateReports(runId);
        await generateRanking(runId);

        console.log("✅ Pipeline done");

    } catch (err) {
        console.log("❌ Pipeline error:", err);
    }

    console.log("PIPELINE RUNID:", runId);
}

module.exports = processPipeline;