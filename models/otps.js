const mongoose = require("mongoose");

const schema = mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

const otps = mongoose.model("otps", schema);

module.exports = otps;
