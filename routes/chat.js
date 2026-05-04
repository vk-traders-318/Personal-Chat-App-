const express = require("express");
const router = express.Router();
const Message = require("../models/Message");


// 🔥 Send Message
router.post("/send", async (req, res) => {
    const { sender, receiver, message } = req.body;

    await Message.create({ sender, receiver, message });

    res.json({ status: "ok" });
});


// 🔥 Get Messages
router.get("/messages", async (req, res) => {
    const { sender, receiver } = req.query;

    const msgs = await Message.find({
        $or: [
            { sender, receiver },
            { sender: receiver, receiver: sender }
        ]
    }).sort({ created_at: 1 });

    res.json({ status: "ok", messages: msgs });
});

module.exports = router;
