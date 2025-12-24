import React, { useState, useEffect } from 'react';
import { postAPI, commentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CommentSection from '../Comments/CommentSection';

const Post = ({ post: initialPost, onDelete }) => {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isOwner = user?.id === post.user._id;

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    try {
      const response = await commentAPI.getComments(post._id);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await postAPI.likePost(post._id);
      setPost({
        ...post,
        likesCount: response.data.likes,
        likes: response.data.liked 
          ? [...post.likes, user.id]
          : post.likes.filter(id => id !== user.id)
      });
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const response = await commentAPI.addComment(post._id, { text: commentText });
      setComments([response.data, ...comments]);
      setPost({ ...post, commentsCount: post.commentsCount + 1 });
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
      setPost({ ...post, commentsCount: Math.max(0, post.commentsCount - 1) });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postAPI.deletePost(post._id);
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return postDate.toLocaleDateString();
  };

  const isLiked = post.likes?.includes(user?.id);

  return (
    <div className="post">
      <div className="post-header">
        <img 
          src={post.user.profileImage || 'https://via.placeholder.com/48'} 
          alt={post.user.username}
          className="post-avatar"
        />
        <div className="post-user-info">
          <h4>{post.user.username}</h4>
          <p>{formatDate(post.createdAt)}</p>
        </div>
        {isOwner && (
          <button 
            onClick={handleDelete} 
            className="btn btn-danger btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            Delete
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {post.image && (
        <img 
          src={post.image} 
          alt="Post" 
          className="post-image"
          onError={(e) => e.target.style.display = 'none'}
        />
      )}

      <div className="post-actions">
        <button 
          onClick={handleLike} 
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{post.likesCount || 0} Likes</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)} 
          className="post-action-btn"
        >
          <span>💬</span>
          <span>{post.commentsCount || 0} Comments</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? 'Posting...' : 'Comment'}
            </button>
          </form>

          {comments.map(comment => (
            <div key={comment._id} className="comment">
              <img 
                src={comment.user.profileImage || 'https://via.placeholder.com/36'} 
                alt={comment.user.username}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-user">{comment.user.username}</div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-time">{formatDate(comment.createdAt)}</div>
              </div>
              {user?.id === comment.user._id && (
                <button 
                  onClick={() => handleDeleteComment(comment._id)}
                  className="btn btn-danger btn-sm"
                  style={{ marginLeft: 'auto' }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;