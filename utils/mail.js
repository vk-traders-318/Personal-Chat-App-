const nodemailer = require("nodemailer"); // ❗ रखा है (remove नहीं किया)
const { Resend } = require("resend");     // ✅ नया add

// nodemailer transporter (as it is रखा)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Resend setup
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTP(email, otp) {
    try {
        console.log("Sending OTP to:", email);

        // 🔥 Resend से mail भेजेंगे
        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Your OTP Code",
            html: `<h2>Your OTP is: ${otp}</h2>`
        });

        console.log("OTP sent successfully ✅", response);

    } catch (err) {
        console.log("❌ Mail Error:", err.message);
    }
}

module.exports = { sendOTP };
