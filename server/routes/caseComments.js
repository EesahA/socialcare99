const express = require('express');
const CaseComment = require('../models/CaseComment');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/cases/:caseId/comments', auth, async (req, res) => {
  try {
    const comments = await CaseComment.find({ caseId: req.params.caseId })
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching case comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

router.post('/cases/:caseId/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = new CaseComment({
      caseId: req.params.caseId,
      userId: req.user._id,
      userFirstName: req.user.firstName,
      userLastName: req.user.lastName,
      text: text.trim()
    });

    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error adding case comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

router.delete('/case-comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await CaseComment.findOne({ 
      _id: req.params.commentId, 
      userId: req.user._id 
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or you do not have permission to delete it' });
    }

    await CaseComment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting case comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

module.exports = router; 