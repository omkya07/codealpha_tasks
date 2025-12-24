import React from 'react';

const CommentSection = ({ comments, onDelete, currentUserId }) => {
  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return commentDate.toLocaleDateString();
  };

  return (
    <div>
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
          {currentUserId === comment.user._id && (
            <button 
              onClick={() => onDelete(comment._id)}
              className="btn btn-danger btn-sm"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentSection;