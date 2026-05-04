const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
