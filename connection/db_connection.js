const mongoose = require("mongoose");

const mongodb = mongoose.connect(process.env.BASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("mongodb is connected");
}).catch((error) => {
    console.error("mongodb not connected", error);
});

module.exports = mongodb;