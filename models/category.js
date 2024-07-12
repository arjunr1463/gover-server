const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  candidates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "candidates",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const category = mongoose.model("category", categorySchema);

module.exports = category;
