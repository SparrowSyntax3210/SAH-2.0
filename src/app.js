const express = require("express");
const app = express();
const {extractText}=require("./services/pdfextracter");
const {parseResume}=require("./services/resumeparser");
const saveResumeReport=require("./services/report");
const upload = require("../config/multer");
const path = require("path");
const fs = require("fs");
const Resume = require("../models/resume");
const scoreCandidateReports = require("./services/scoring");
const generateRanking = require("./services/ranking");


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname , "../public")))

app.get("/test", (req, res) => {
    res.send("Server Works");
});


app.post("/upload", upload.array("resume"), async (req, res) => {

    try {

        if (!req.files?.length) {

            return res.status(400).json({
                success: false,
                message: "No resumes uploaded."
            });

        }

        await Resume.deleteMany({});

        fs.rmSync(
            path.join(process.cwd(), "reports", "candidate"),
            {
                recursive: true,
                force: true
            }
        );

        fs.rmSync(
            path.join(process.cwd(), "score"),
            {
                recursive: true,
                force: true
            }
        );

        const results = [];

        for (const file of req.files) {

            try {

                console.log(
                    "\nProcessing:",
                    file.originalname
                );

                const text =
                    await extractText(file.path);

                const parsedResume =
                    await parseResume(text);

                const reportPath =
                    saveResumeReport(
                        file.path,
                        text,
                        parsedResume,
                        "candidate"
                    );

                const resume =
                    await Resume.create({

                        filename: file.originalname,

                        reportPath,

                        ...parsedResume

                    });

                results.push(resume);

                console.log(
                    "✅ Finished:",
                    file.originalname
                );

            }
            catch (err) {

                console.error(
                    "❌ Failed:",
                    file.originalname
                );

                console.error(err);

            }

        }

        if (results.length === 0) {

            return res.status(500).json({
                success: false,
                message: "No resume could be parsed."
            });

        }

        await scoreCandidateReports();

        const ranking =
            await generateRanking();

        res.json({

            success: true,

            uploaded: results.length,

            resumes: results,

            ranking

        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});


app.post("/upload/sample", upload.single("sampleResume"), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No sample resume uploaded."
            });
        }

        const text = await extractText(req.file.path);

        const parsedSample = await parseResume(text);

        const reportPath = await saveResumeReport(
            req.file.path,
            text,
            parsedSample,
            "sample"
        );

        res.json({
            success: true,
            message: "Sample Resume Parsed Successfully",
            reportPath,
            report: parsedSample
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
});

app.get("/score", async (req, res) => {

    try{

        const scores = await scoreCandidateReports();

        res.json({

            success:true,

            scores

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

app.get("/ranking", async (req, res) => {
    try {
        const fs = require("fs");
        const path = require("path");

        const rankingPath = path.join(
            process.cwd(),
            "score",
            "finalRanking.json"
        );

        if (!fs.existsSync(rankingPath)) {
            return res.json([]);
        }

        const ranking = JSON.parse(
            fs.readFileSync(rankingPath, "utf8")
        );

        res.json(ranking);

    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});


app.get("/api/report/:file", (req, res) => {

    try {

        const fileParam = req.params.file;

        const reportDir = path.join(process.cwd(), "reports", "candidate");
        const scoreDir = path.join(process.cwd(), "score");

        const reports = fs.readdirSync(reportDir);

        for (const f of reports) {

            const reportPath = path.join(reportDir, f);
            const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

            const storedName = (report.metadata.filename || "")
                .split("\\")
                .pop();

            if (storedName === fileParam) {

                // 🔥 find score file
                const scoreFolders = fs.readdirSync(scoreDir)
                    .filter(d => d.endsWith("-upload"));

                let breakdown = null;

                for (const folder of scoreFolders) {

                    const scoreFiles = fs.readdirSync(
                        path.join(scoreDir, folder)
                    );

                    for (const sf of scoreFiles) {

                        const scoreData = JSON.parse(
                            fs.readFileSync(
                                path.join(scoreDir, folder, sf),
                                "utf8"
                            )
                        );

                        if (scoreData.filename === storedName) {
                            breakdown = scoreData.breakdown;
                            break;
                        }
                    }

                }

                return res.json({
                    filename: storedName,
                    parsedData: report.parsedData,
                    text: report.text,
                    breakdown
                });

            }
        }

        return res.status(404).json({
            message: "Report not found"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = app;