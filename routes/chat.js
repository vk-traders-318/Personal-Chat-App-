const express = require("express");
const router = express.Router();

const Message = require("../models/Message");


// =========================
// 🔥 SEND MESSAGE
// =========================
router.post("/send", async function (req, res) {
    try {
        const { sender, receiver, message } = req.body;

        if (!sender || !receiver || !message) {
            return res.json({ status: "error", msg: "Missing fields" });
        }

        await Message.create({
            sender,
            receiver,
            message
        });

        res.json({ status: "ok" });

    } catch (err) {
        console.log(err.message);
        res.json({ status: "error", msg: "Send failed" });
    }
});


// =========================
// 🔥 GET MESSAGES
// =========================
router.get("/messages", async function (req, res) {
    try {
        const { sender, receiver } = req.query;

        const msgs = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ created_at: 1 });

        res.json({ status: "ok", messages: msgs });

    } catch (err) {
        console.log(err.message);
        res.json({ status: "error", msg: "Fetch failed" });
    }
});


// =========================
// 🔥 RECENT CHATS (LAST MESSAGE)
// =========================
router.get("/recent-chats", async function (req, res) {
    try {
        const { user } = req.query;

        const messages = await Message.find({
            $or: [
                { sender: user },
                { receiver: user }
            ]
        }).sort({ created_at: -1 });

        const map = {};

        for (let i = 0; i < messages.length; i++) {

            const msg = messages[i];

            const otherUser =
                msg.sender === user ? msg.receiver : msg.sender;

            if (!map[otherUser]) {
                map[otherUser] = {
                    email: otherUser,
                    lastMessage: msg.message,
                    time: msg.created_at
                };
            }
        }

        const result = Object.values(map);

        res.json({ status: "ok", chats: result });

    } catch (err) {
        console.log(err.message);
        res.json({ status: "error", msg: "Failed" });
    }
});


module.exports = router;
