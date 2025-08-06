import React from 'react';
import './Comment.css';

const Comment = ({ comment, currentUser }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (userId) => {
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6',
      '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b'
    ];
    return colors[userId.charCodeAt(userId.length - 1) % colors.length];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="comment">
      <div className="comment-avatar">
        <div 
          className="avatar-initials"
          style={{ backgroundColor: getAvatarColor(comment.userId) }}
        >
          {getInitials(comment.userFirstName, comment.userLastName)}
        </div>
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">
            {comment.userFirstName} {comment.userLastName}
          </span>
          <span className="comment-date">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <div className="comment-text">
          {comment.text}
        </div>
      </div>
    </div>
  );
};

export default Comment; 