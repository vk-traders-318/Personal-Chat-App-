const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTP(email, otp) {
    try {
        const response = await resend.emails.send({
            from: "Chat App <onboarding@resend.dev>",
            to: email,
            subject: "Your OTP Code",
            html: "<h2>Your OTP is: " + otp + "</h2>"
        });

        console.log("OTP sent:", response);
        return true;

    } catch (err) {
        console.log("Mail Error:", err.message);
        throw err; // ❗ important
    }
}

module.exports = { sendOTP };
