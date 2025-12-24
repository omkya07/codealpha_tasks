import React, { useState, useEffect } from 'react';
import { postAPI } from '../../services/api';
import Post from './Post';
import CreatePost from './CreatePost';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await postAPI.getFeed();
      setPosts(response.data.posts);
    } catch (err) {
      setError('Failed to load feed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  if (loading) {
    return <div className="loading">Loading feed...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <CreatePost onPostCreated={handlePostCreated} />

      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>Follow some users or create your first post!</p>
        </div>
      ) : (
        posts.map(post => (
          <Post 
            key={post._id} 
            post={post} 
            onDelete={handlePostDeleted}
          />
        ))
      )}
    </div>
  );
};

export default Feed;