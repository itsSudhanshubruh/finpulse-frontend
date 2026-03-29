const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    text: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
