const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  vote: {
    type: Array,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const users = mongoose.model("users", userSchema);

module.exports = users;