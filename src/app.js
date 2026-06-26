const express = require("express");
const app = express();
const {extractText}=require("./services/pdfextracter");
const {parseResume}=require("./services/resumeparser");
const {saveResumeReport}=require("./services/report");
const upload = require("../config/multer");
const path = require("path");
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname , "../public")))
console.log(path.join(__dirname, "../public/html"));

console.log(
    fs.existsSync(path.join(__dirname, "../public/html"))
);

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

          // 1. Extract text
          const text = await extractText(file.path);

          // 2. Parse using OpenRouter
          const parsedResume = await parseResume(text);

          // 3. Save report
          const reportPath = await saveResumeReport(
              file.path,
              text,
              parsedResume
          );

          // 4. Save to MongoDB
          const resume = await Resume.create({
              filename: file.originalname,
              reportPath,
              ...parsedResume
          });

          results.push(resume);
      }

      res.json({
          success: true,
          count: results.length,
          resumes: results
      });

  } catch (err) {
      console.error(err);
      res.status(500).json({
          success: false,
          message: err.message
      });
  }
});

module.exports = app;