const express = require("express");
const router = express.Router();
const User = require("../models/User");
const OTP = require("../models/Otp");
const bcrypt = require("bcryptjs");
const { sendOTP } = require("../utils/mail");

// Signup
router.post("/signup", async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ status: "error", msg: "Missing fields" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({ status: "error", msg: "User already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60000)
        });

        // 🔥 OTP send (await important)
        await sendOTP(email, otp);

        res.json({ status: "ok", msg: "OTP sent" });

    } catch (err) {
        console.log("Signup Error:", err.message);
        res.json({ status: "error", msg: "Signup failed" });
    }
});

// Verify OTP
router.post("/verify-otp", async function (req, res) {
    try {
        const { email, password, otp } = req.body;

        const record = await OTP.findOne({ email, otp });

        if (!record) {
            return res.json({ status: "error", msg: "Invalid OTP" });
        }

        if (record.expiresAt < new Date()) {
            return res.json({ status: "error", msg: "OTP expired" });
        }

        const hash = await bcrypt.hash(password, 10);

        await User.create({ email, password: hash });

        await OTP.deleteMany({ email });

        res.json({ status: "ok", msg: "Account created" });

    } catch (err) {
        console.log("Verify Error:", err.message);
        res.json({ status: "error", msg: "Verification failed" });
    }
});

// Login
router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ status: "error", msg: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.json({ status: "error", msg: "Wrong password" });
        }

        res.json({ status: "ok", msg: "Login success" });

    } catch (err) {
        console.log("Login Error:", err.message);
        res.json({ status: "error", msg: "Login failed" });
    }
});

module.exports = router;
