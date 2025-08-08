const express = require('express');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/tasks/:taskId/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .sort({ createdAt: -1 }); // Changed to -1 for newest first
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

router.post('/tasks/:taskId/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    const comment = new Comment({
      taskId: req.params.taskId,
      userId: req.user._id,
      userFirstName: req.user.firstName,
      userLastName: req.user.lastName,
      text: text.trim()
    });
    
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      userId: req.user._id
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or you do not have permission to delete it' });
    }
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

module.exports = router; 