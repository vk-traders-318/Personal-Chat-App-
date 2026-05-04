const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendOTP(email, otp) {
    try {
        console.log("Sending OTP to:", email);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: "Your OTP is: " + otp
        });

        console.log("OTP sent successfully ✅");

    } catch (err) {
        console.log("❌ Mail Error:", err.message);
        throw err;
    }
}

module.exports = { sendOTP };
