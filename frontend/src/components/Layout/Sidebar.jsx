import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const profileLink = user?.id || user?._id;

  return (
    <div className="sidebar">
      <div className="sidebar-user">
        <img 
          src={user?.profileImage || 'https://via.placeholder.com/60'} 
          alt={user?.username}
          className="sidebar-avatar"
        />
        <h3>{user?.username}</h3>
        <p>{user?.bio || 'No bio yet'}</p>
      </div>

      <nav className="sidebar-nav">
        <Link to="/" className={`sidebar-link ${isActive('/')}`}>
          <span>🏠</span>
          <span>Home</span>
        </Link>
        
        <Link to={`/profile/${profileLink}`} className={`sidebar-link ${isActive(`/profile/${profileLink}`)}`}>
          <span>👤</span>
          <span>Profile</span>
        </Link>
        
        <Link to="/search" className={`sidebar-link ${isActive('/search')}`}>
          <span>🔍</span>
          <span>Search</span>
        </Link>
      </nav>

      <div className="sidebar-stats">
        <div className="sidebar-stat">
          <strong>{user?.followers?.length || 0}</strong>
          <span>Followers</span>
        </div>
        <div className="sidebar-stat">
          <strong>{user?.following?.length || 0}</strong>
          <span>Following</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;