const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.createPost = async (req, res) => {
  try {
    const { content, media, image } = req.body;

    // Handle both old (image) and new (media) format
    let mediaData = {
      url: '',
      type: 'none'
    };

    if (media && media.url) {
      // New format with media object
      mediaData = {
        url: media.url,
        type: media.type || 'image'
      };
    } else if (image) {
      // Old format with image URL
      mediaData = {
        url: image,
        type: 'image'
      };
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      media: mediaData
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profileImage');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const followingIds = req.user.following || [];
    const userIds = [req.user._id, ...followingIds];

    const posts = await Post.find({ user: { $in: userIds } })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Ensure all posts have media field
    const normalizedPosts = posts.map(post => ({
      ...post,
      media: post.media || { url: post.image || '', type: post.image ? 'image' : 'none' }
    }));

    const total = await Post.countDocuments({ user: { $in: userIds } });

    res.json({
      posts: normalizedPosts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 })
      .lean();

    // Ensure all posts have media field
    const normalizedPosts = posts.map(post => ({
      ...post,
      media: post.media || { url: post.image || '', type: post.image ? 'image' : 'none' }
    }));

    res.json(normalizedPosts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profileImage')
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ensure post has media field
    const normalizedPost = {
      ...post,
      media: post.media || { url: post.image || '', type: post.image ? 'image' : 'none' }
    };

    res.json(normalizedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content, media, image } = req.body;
    
    post.content = content || post.content;
    
    if (media) {
      post.media = media;
    } else if (image !== undefined) {
      post.media = {
        url: image,
        type: image ? 'image' : 'none'
      };
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username profileImage');

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.deleteMany({ post: req.params.id });
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      post.likesCount = post.likes.length;
    } else {
      post.likes.push(req.user._id);
      post.likesCount = post.likes.length;
    }

    await post.save();

    res.json({ likes: post.likesCount, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};