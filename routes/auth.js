const express = require("express");
const router = express.Router();

const User = require("../models/User");
const OTP = require("../models/Otp");

const bcrypt = require("bcryptjs");
const { sendOTP } = require("../utils/mail");


// =========================
// 🔥 SIGNUP (SEND OTP)
// =========================
router.post("/signup", async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ status: "error", msg: "Missing fields" });
        }

        // user already exists check
        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({ status: "error", msg: "Email already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            password,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60000)
        });

        await sendOTP(email, otp);

        res.json({ status: "ok", msg: "OTP sent" });

    } catch (err) {
        console.log(err.message);
        res.json({ status: "error", msg: "Signup failed" });
    }
});


// =========================
// 🔥 VERIFY OTP + CREATE USER
// =========================
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

        // username unique check
        const exist = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (exist) {
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
        console.log(err.message);
        res.json({ status: "error", msg: "Verification failed" });
    }
});


// =========================
// 🔥 LOGIN (EMAIL OR USERNAME)
// =========================
router.post("/login", async function (req, res) {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.json({ status: "error", msg: "Missing fields" });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (!user) {
            return res.json({ status: "error", msg: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.json({ status: "error", msg: "Wrong password" });
        }

        res.json({
            status: "ok",
            user: {
                email: user.email,
                username: user.username
            }
        });

    } catch (err) {
        console.log(err.message);
        res.json({ status: "error", msg: "Login failed" });
    }
});


// =========================
// 🔥 RESET PASSWORD - SEND OTP
// =========================
router.post("/reset-send-otp", async function (req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ status: "error", msg: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60000)
        });

        await sendOTP(email, otp);

        res.json({ status: "ok", msg: "OTP sent" });

    } catch (err) {
        console.log(err.message);
        res.json({ status: "error", msg: "Failed" });
    }
});


// =========================
// 🔥 RESET PASSWORD - VERIFY + UPDATE
// =========================
router.post("/reset-password", async function (req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        const record = await OTP.findOne({ email, otp });

        if (!record) {
            return res.json({ status: "error", msg: "Invalid OTP" });
        }

        if (record.expiresAt < new Date()) {
            return res.json({ status: "error", msg: "OTP expired" });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await User.updateOne({ email }, { password: hash });

        await OTP.deleteMany({ email });

        res.json({ status: "ok", msg: "Password updated" });

    } catch (err) {
        console.log(err.message);
        res.json({ status: "error", msg: "Failed" });
    }
});


// =========================
// 🔥 GET USERS
// =========================
router.get("/users", async function (req, res) {
    try {
        const { email } = req.query;

        const users = await User.find({ email: { $ne: email } })
            .select("username email");

        res.json({ status: "ok", users });

    } catch {
        res.json({ status: "error", msg: "Failed" });
    }
});


// =========================
// 🔥 SEARCH USERS
// =========================
router.get("/search", async function (req, res) {
    try {
        const { query } = req.query;

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }).select("username email");

        res.json({ status: "ok", users });

    } catch {
        res.json({ status: "error", msg: "Search failed" });
    }
});


module.exports = router;
