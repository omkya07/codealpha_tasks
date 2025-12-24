const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers
} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/search', auth, searchUsers);
router.get('/:id', auth, getUserProfile);
router.put('/profile', auth, updateProfile);
router.post('/:id/follow', auth, followUser);
router.delete('/:id/follow', auth, unfollowUser);

module.exports = router;