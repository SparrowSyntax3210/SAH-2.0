const { askAi } = require("./openrouter");

async function parseResume(resumeText) {

    const messages = [

        {
            role: "system",

            content: `
You are an expert ATS Resume Parser.

Extract every possible detail from the resume.

Return ONLY valid JSON.

Schema:

{
"name":"",
"email":"",
"phone":"",
"summary":"",
"skills":[],
"softSkills":[],
"education":[],
"experience":[],
"projects":[],
"certifications":[],
"languages":[],
"achievements":[],
"linkedin":"",
"github":"",
"portfolio":""
}

Never return markdown.
Never explain.
Only JSON.
`
        },

        {
            role: "user",

            content: resumeText
        }

    ];

    const response = await askAi(messages);

    return JSON.parse(response);

}

module.exports = {
    parseResume
};