const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/:postId', auth, addComment);
router.get('/:postId', auth, getComments);
router.delete('/:id', auth, deleteComment);

module.exports = router;