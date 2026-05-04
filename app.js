require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/chat", require("./routes/chat"));

app.get("/", function (req, res) {
    res.send("API Running");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, function () {
    console.log("Server running on port " + PORT);
});
