const express = require("express");
const router = express.Router();
const User = require("../models/User");
const OTP = require("../models/Otp");
const bcrypt = require("bcryptjs");
const { sendOTP } = require("../utils/mail");


// 🔥 Signup (send OTP)
router.post("/signup", async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.json({ status: "error", msg: "Missing fields" });
        }

        const exist = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (exist) {
            return res.json({ status: "error", msg: "Email or Username exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            username,
            password,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60000)
        });

        await sendOTP(email, otp);

        res.json({ status: "ok", msg: "OTP sent" });

    } catch (err) {
        res.json({ status: "error", msg: "Signup failed" });
    }
});


// 🔥 Verify OTP
router.post("/verify-otp", async function (req, res) {
    try {
        const { email, otp, username } = req.body;

        if (!email || !otp || !username) {
            return res.json({ status: "error", msg: "Missing fields" });
        }

        const record = await OTP.findOne({ email, otp });

        if (!record) {
            return res.json({ status: "error", msg: "Invalid OTP" });
        }

        if (record.expiresAt < new Date()) {
            return res.json({ status: "error", msg: "OTP expired" });
        }

        // 🔥 username unique check
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.json({ status: "error", msg: "Email or Username already exists" });
        }

        const hash = await bcrypt.hash(record.password, 10);

        await User.create({
            email: record.email,
            username: username,
            password: hash
        });

        await OTP.deleteMany({ email });

        res.json({ status: "ok", msg: "Account created" });

    } catch (err) {
        console.log("Verify Error:", err.message);
        res.json({ status: "error", msg: "Verification failed" });
    }
});


// 🔥 Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.json({ status: "error", msg: "User not found" });

        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.json({ status: "error", msg: "Wrong password" });

        res.json({
            status: "ok",
            user: {
                email: user.email,
                username: user.username
            }
        });

    } catch {
        res.json({ status: "error", msg: "Login failed" });
    }
});


// 🔥 Get Users
router.get("/users", async (req, res) => {
    const { email } = req.query;

    const users = await User.find({ email: { $ne: email } })
        .select("username email");

    res.json({ status: "ok", users });
});


// 🔥 Search Users
router.get("/search", async (req, res) => {
    const { query } = req.query;

    const users = await User.find({
        username: { $regex: query, $options: "i" }
    }).select("username email");

    res.json({ status: "ok", users });
});

module.exports = router;
