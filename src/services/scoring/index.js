const fs = require("fs");
const path = require("path");

const scoreSkills = require("./scoreSkills");
const scoreExperience = require("./scoreExperience");
const scoreProjects = require("./scoreProjects");
const scoreEducation = require("./scoreEducation");
const scoreCertifications = require("./scoreCertifications");
const scoreLinks = require("./scoreLinks");
const scoreCompleteness = require("./scoreCompleteness");

const { saveScore } = require("./saveScore");
const { REPORT_DIR } = require("../../config/path");

async function scoreCandidateReports(runId) {

    const files = fs.readdirSync(REPORT_DIR)
        .filter(f => f.endsWith(".json"));

    console.log("FILES FOUND FOR SCORING:", files.length);

    const results = [];

    for (const file of files) {

        const report = JSON.parse(
            fs.readFileSync(path.join(REPORT_DIR, file), "utf8")
        );

        const parsed = report.parsedData;

        const scores = {
            skills: scoreSkills(parsed),
            experience: scoreExperience(parsed),
            projects: scoreProjects(parsed),
            education: scoreEducation(parsed),
            certifications: scoreCertifications(parsed),
            links: scoreLinks(parsed),
            completeness: scoreCompleteness(parsed)
        };

        const total =
            scores.skills.score +
            scores.experience.score +
            scores.projects.score +
            scores.education.score +
            scores.certifications.score +
            scores.links.score +
            scores.completeness.score;

        const finalReport = {
            filename: report.metadata.filename,
            totalScore: total,
            breakdown: scores
        };

        // ✅ SAFE
        saveScore(finalReport, runId);

        results.push(finalReport);
    }

    return results;
}

module.exports = scoreCandidateReports;