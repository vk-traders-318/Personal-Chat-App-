require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB connected"))
    .catch(err => console.log(err));

app.use("/auth", require("./routes/auth"));
app.use("/chat", require("./routes/chat"));

app.get("/", (req, res) => {
    res.send("API running");
});

app.listen(process.env.PORT || 10000, () => {
    console.log("Server started");
});
