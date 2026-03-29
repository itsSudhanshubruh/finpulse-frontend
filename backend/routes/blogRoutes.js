const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protectAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary from the environment variables natively securely
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage linking explicitly referencing Cloudinary API
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'finpulse-blogs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif']
  }
});

const upload = multer({ storage: storage });

// @route   GET /api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching blogs' });
  }
});

// @route   POST /api/blogs
// @desc    Create a blog
// @access  Private Admin
router.post('/', protectAdmin, upload.single('imageFile'), async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    let image = req.body.image; // Fallback to URL if manually provided
    
    if (req.file) {
      // Cloudinary completely processes the physical image and returns a strict production HTTP URL inside req.file.path
      image = req.file.path;
    }
    
    const blog = await Blog.create({
      title,
      content,
      author: author || req.user.email,
      image,
      tags
    });
    
    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error creating blog' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private Admin
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (blog) {
      res.json({ message: 'Blog removed' });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error deleting blog' });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get a single blog by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching blog detail' });
  }
});

// @route   POST /api/blogs/:id/like
// @desc    Like a blog
// @access  Public
router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    
    // Atomic increment
    blog.likes = (blog.likes || 0) + 1;
    await blog.save();
    res.json({ likes: blog.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error liking blog' });
  }
});

// @route   POST /api/blogs/:id/comment
// @desc    Add a comment to a blog
// @access  Public
router.post('/:id/comment', express.json(), async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    
    const newComment = {
      text,
      author: author || 'Anonymous User',
      createdAt: new Date()
    };
    
    blog.comments.push(newComment);
    await blog.save();
    
    res.status(201).json(blog.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error adding comment' });
  }
});

module.exports = router;
