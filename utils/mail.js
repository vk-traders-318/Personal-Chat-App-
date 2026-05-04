const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTP(email, otp) {
    try {
        console.log("Sending OTP to:", email);

        const response = await resend.emails.send({
            from: "Chat App <noreply@personalchatapp.in>",
            to: email,
            subject: "Your OTP Code",
            html: `<h2>Your OTP is: ${otp}</h2>`
        });

        console.log("OTP sent successfully:", response);

    } catch (err) {
        console.log("MAIL ERROR:", err.message);
        throw err;
    }
}

module.exports = { sendOTP };
