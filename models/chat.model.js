const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    content: { type: String, required: true },
    icon: { type: String, required: true },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

module.exports = mongoose.model('Chat', ChatSchema);