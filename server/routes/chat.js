const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Send message
router.post("/send-message", async function (req, res) {
    try {
        const { sender, receiver, text, media } = req.body;

        const msg = await Message.create({
            sender,
            receiver,
            text,
            media
        });

        res.json({ status: "ok", message: msg });

    } catch (err) {
        res.json({ status: "error", msg: "Send failed" });
    }
});

// Get messages
router.get("/get-messages", async function (req, res) {
    try {
        const { sender, receiver, lastId } = req.query;

        let query = {
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        };

        if (lastId) {
            query._id = { $gt: lastId };
        }

        const messages = await Message.find(query).sort({ created_at: 1 });

        res.json({ status: "ok", messages });

    } catch (err) {
        res.json({ status: "error", msg: "Fetch failed" });
    }
});

module.exports = router;
