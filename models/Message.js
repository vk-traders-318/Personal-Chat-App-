const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    text: String,
    media: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);
