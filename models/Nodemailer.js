const nodemailer = require("nodemailer");

async function sendEmail(toEmail) {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "goelharsh1207@gmail.com",
            pass: "dgnp frxq zhui mbwx"
        }
    });

    const mailOptions = {
        from: "goelharsh1207@gmail.com",
        to: toEmail,
        subject: "Resume Received ✔",
        text: "Hello,\n\nYour resume has been successfully received and processed.\n\nThank you!"
    };

    try {

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ Email sent:", info.response);

    } catch (error) {

        console.log("❌ Email error:", error);

    }
}

module.exports = sendEmail;