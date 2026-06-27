const express = require("express");
const app = express();
const {extractText}=require("./services/pdfextracter");
const {parseResume}=require("./services/resumeparser");
const {saveResumeReport}=require("./services/report");
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

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No resumes uploaded."
            });
        }

        await Resume.deleteMany({});

        const results = [];

        for (const file of req.files) {

            // Extract PDF text
            const text = await extractText(file.path);

            // Parse using OpenRouter
            const parsedResume = await parseResume(text);

            // Save report
            const reportPath = await saveResumeReport(
                file.path,
                text,
                parsedResume,
                "candidate"
            );

            // Save MongoDB
            const resume = await Resume.create({
                filename: file.originalname,
                reportPath,
                ...parsedResume
            });

            results.push(resume);
        }
                const scores = await scoreCandidateReports();

                const ranking = await generateRanking();

                res.json({
                    success: true,
                    uploaded: results.length,
                    resumes: results,
                    ranking
                });

    } catch (err) {

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
        const generateRanking = require("./services/ranking");
        const ranking = await generateRanking();

        res.json({
            success: true,
            ranking
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = app;