import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, postAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Post from '../Feed/Post';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    loadProfile();
    loadUserPosts();
  }, [id]);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile(id);
      setUser(response.data);
      setIsFollowing(response.data.followers?.some(f => f._id === currentUser?.id));
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const response = await postAPI.getUserPosts(id);
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(id);
        setUser({
          ...user,
          followers: user.followers.filter(f => f._id !== currentUser.id)
        });
      } else {
        await userAPI.followUser(id);
        setUser({
          ...user,
          followers: [...user.followers, { _id: currentUser.id }]
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="container">
      <div className="profile-header">
        <img 
          src={user.profileImage || 'https://via.placeholder.com/120'} 
          alt={user.username}
          className="profile-avatar"
        />
        <h2>{user.username}</h2>
        <p>{user.bio || 'No bio yet'}</p>
        
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-number">{posts.length}</div>
            <div className="profile-stat-label">Posts</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-number">{user.followers?.length || 0}</div>
            <div className="profile-stat-label">Followers</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-number">{user.following?.length || 0}</div>
            <div className="profile-stat-label">Following</div>
          </div>
        </div>

        {isOwnProfile ? (
          <button 
            onClick={() => navigate('/profile/edit')} 
            className="btn btn-secondary"
            style={{ marginTop: '20px' }}
          >
            Edit Profile
          </button>
        ) : (
          <button 
            onClick={handleFollow} 
            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
            style={{ marginTop: '20px' }}
            disabled={followLoading}
          >
            {followLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <h3 style={{ marginBottom: '20px' }}>Posts</h3>
      
      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>{isOwnProfile ? 'Create your first post!' : 'This user hasn\'t posted anything yet'}</p>
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

export default Profile;