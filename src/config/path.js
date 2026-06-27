const path = require("path");

const ROOT_DIR = process.cwd();

const SCORE_DIR = path.join(ROOT_DIR, "score");
const REPORT_DIR = path.join(ROOT_DIR, "reports", "candidate");

module.exports = {
    SCORE_DIR,
    REPORT_DIR,
    ROOT_DIR
};