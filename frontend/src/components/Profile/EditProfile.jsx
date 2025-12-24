import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userAPI.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      const profileLink = user?.id || user?._id;
      setTimeout(() => {
        navigate(`/profile/${profileLink}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const profileLink = user?.id || user?._id;

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              name="bio"
              className="form-control"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              maxLength="200"
              placeholder="Tell us about yourself..."
            />
            <small style={{ color: '#666' }}>{formData.bio.length}/200 characters</small>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Image URL</label>
            <input
              type="url"
              name="profileImage"
              className="form-control"
              value={formData.profileImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {formData.profileImage && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <img 
                src={formData.profileImage} 
                alt="Preview" 
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate(`/profile/${profileLink}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;