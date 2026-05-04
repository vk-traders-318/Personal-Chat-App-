const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTP(email, otp) {
    await resend.emails.send({
        from: "Chat App <noreply@personalchatapp.in>",
        to: email,
        subject: "Your OTP",
        html: `<h2>Your OTP is ${otp}</h2>`
    });
}

module.exports = { sendOTP };
