const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

async function askAi(messages) {
    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",

                response_format: {
                    type: "json_object"
                },

                messages
            },

            {
                headers: {
                    Authorization: `Bearer ${process.env.KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (err) {

        console.error(
            "OpenRouter Error:",
            err.response?.data || err.message
        );

        throw err;
    }
}

module.exports = {
    askAi
};