const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on("connected", function () {
    console.log("MongoDB Connected");
});

mongoose.connection.on("error", function (err) {
    console.log("MongoDB Error:", err);
});
