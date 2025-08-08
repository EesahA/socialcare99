import React from 'react';
import './Comment.css';

const Comment = ({ comment, currentUser, onDelete }) => {
  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return '?';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (userId) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    const index = userId ? userId.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="comment">
      <div className="comment-avatar">
        <div className="avatar-initials" style={{ backgroundColor: getAvatarColor(comment.userId) }}>
          {getInitials(comment.userFirstName, comment.userLastName)}
        </div>
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.userFirstName} {comment.userLastName}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
          {onDelete && (
            <button className="delete-comment-btn" onClick={onDelete} title="Delete comment">
              🗑️
            </button>
          )}
        </div>
        <div className="comment-text">{comment.text}</div>
      </div>
    </div>
  );
};

export default Comment; 