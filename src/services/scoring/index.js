const fs = require("fs");
const path = require("path");

const scoreSkills = require("./scoreSkills");
const scoreExperience = require("./scoreExperience");
const scoreProjects = require("./scoreProjects");
const scoreEducation = require("./scoreEducation");
const scoreCertifications = require("./scoreCertifications");
const scoreLinks = require("./scoreLinks");
const scoreCompleteness = require("./scoreCompleteness");
const saveScore = require("./saveScore");

async function scoreCandidateReports() {

    const reportFolder = path.join(
        process.cwd(),
        "reports",
        "candidate"
    );

    const files = fs
        .readdirSync(reportFolder)
        .filter(file => file.endsWith(".json"));

    const results = [];

    for (const file of files) {

        const report = JSON.parse(
            fs.readFileSync(
                path.join(reportFolder, file),
                "utf8"
            )
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

        // ✅ IMPORTANT FIX
        await saveScore(finalReport);

        results.push(finalReport);
    }

    return results;
}

module.exports = scoreCandidateReports;