const express = require("express");
const router = express.Router();
const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const { sendOTP } = require("../utils/mail");

// Signup
router.post("/signup", async function (req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (user) {
        return res.json({ status: "error", msg: "User exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({
        email: email,
        otp: otp,
        expiresAt: new Date(Date.now() + 5 * 60000)
    });

    await sendOTP(email, otp);

    res.json({ status: "ok", msg: "OTP sent" });
});

// Verify OTP
router.post("/verify-otp", async function (req, res) {
    const { email, password, otp } = req.body;

    const record = await OTP.findOne({ email: email, otp: otp });

    if (!record) {
        return res.json({ status: "error", msg: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
        return res.json({ status: "error", msg: "OTP expired" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
        email: email,
        password: hash
    });

    await OTP.deleteMany({ email: email });

    res.json({ status: "ok", msg: "Account created" });
});

// Login
router.post("/login", async function (req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.json({ status: "error", msg: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.json({ status: "error", msg: "Wrong password" });
    }

    res.json({ status: "ok", msg: "Login success" });
});

module.exports = router;
