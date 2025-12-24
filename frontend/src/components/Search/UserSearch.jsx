import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await userAPI.searchUsers(query);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(userId);
      } else {
        await userAPI.followUser(userId);
      }
      
      // Update the users list
      setUsers(users.map(user => {
        if (user._id === userId) {
          return {
            ...user,
            followers: isFollowing
              ? user.followers.filter(f => f !== currentUser.id)
              : [...user.followers, currentUser.id]
          };
        }
        return user;
      }));
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  return (
    <div className="container">
      <div className="search-container">
        <h2 style={{ marginBottom: '20px' }}>Search Users</h2>
        
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <input
              type="text"
              className="search-input"
              placeholder="Search by username or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {loading && <div className="loading">Searching...</div>}

      {!loading && searched && users.length === 0 && (
        <div className="empty-state">
          <h3>No users found</h3>
          <p>Try searching with a different keyword</p>
        </div>
      )}

      {users.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '20px' }}>Results ({users.length})</h3>
          {users.map(user => {
            const isFollowing = user.followers?.includes(currentUser?.id);
            
            return (
              <div key={user._id} className="user-item">
                <div className="user-info" onClick={() => navigate(`/profile/${user._id}`)} style={{ cursor: 'pointer' }}>
                  <img 
                    src={user.profileImage || 'https://via.placeholder.com/50'} 
                    alt={user.username}
                    className="user-avatar"
                  />
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>{user.username}</h4>
                    <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{user.bio || 'No bio'}</p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      {user.followers?.length || 0} followers · {user.following?.length || 0} following
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollow(user._id, isFollowing)}
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserSearch;