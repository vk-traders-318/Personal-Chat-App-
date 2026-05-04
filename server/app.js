require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

require("./db");

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", function (req, res) {
    res.send("Server Running");
});

app.listen(process.env.PORT, function () {
    console.log("Server started on port " + process.env.PORT);
});
