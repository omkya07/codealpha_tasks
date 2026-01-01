const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MIGRATION: Fix old posts structure
app.post('/api/fix-posts', async (req, res) => {
  try {
    const Post = require('./models/Post');
    
    // Get ALL posts from database
    const allPosts = await Post.find({}).lean();
    console.log(`Found ${allPosts.length} total posts`);

    let fixed = 0;

    for (const post of allPosts) {
      const updateData = {};
      
      // Check if media field needs fixing
      if (!post.media || typeof post.media.url === 'undefined') {
        updateData.media = {
          url: post.image || '',
          type: (post.image && post.image.trim() !== '') ? 'image' : 'none'
        };
      }

      // Apply update if needed
      if (Object.keys(updateData).length > 0) {
        await Post.updateOne(
          { _id: post._id },
          { $set: updateData }
        );
        fixed++;
        console.log(`Fixed post ${post._id}`);
      }
    }

    res.json({
      success: true,
      message: 'Posts fixed successfully',
      totalPosts: allPosts.length,
      fixedPosts: fixed
    });

  } catch (error) {
    console.error('Fix posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix posts',
      error: error.message
    });
  }
});

// DEBUG: Check posts structure
app.get('/api/debug-posts', async (req, res) => {
  try {
    const Post = require('./models/Post');
    
    const posts = await Post.find({})
      .populate('user', 'username')
      .limit(10)
      .lean();

    res.json({
      totalPosts: posts.length,
      posts: posts.map(p => ({
        _id: p._id,
        content: p.content.substring(0, 50),
        media: p.media,
        image: p.image,
        hasMedia: !!p.media,
        mediaType: typeof p.media,
        mediaUrl: p.media?.url,
        mediaTypeValue: p.media?.type,
        user: p.user?.username
      }))
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CLEANUP: Delete old test posts (optional - remove after use)
app.delete('/api/delete-old-posts', async (req, res) => {
  try {
    const Post = require('./models/Post');
    
    // Delete posts with content "nothing"
    const result = await Post.deleteMany({ 
      content: "nothing" 
    });

    res.json({
      success: true,
      message: 'Old posts deleted',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});