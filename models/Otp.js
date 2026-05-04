const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    otp: String,
    expiresAt: Date
});

module.exports = mongoose.model("Otp", OtpSchema);
