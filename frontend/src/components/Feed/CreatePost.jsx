import React, { useState } from 'react';
import { postAPI } from '../../services/api';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a valid image (JPG, PNG, GIF) or video (MP4, MOV) file');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setFile(selectedFile);
    
    // Determine media type
    const type = selectedFile.type.startsWith('video') ? 'video' : 'image';
    setMediaType(type);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setMediaType(null);
    setUploadProgress(0);
  };

  const uploadFile = async () => {
    if (!file) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      return response.data;
    } catch (err) {
      console.error('Upload error:', err);
      throw new Error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let mediaData = null;

      // Upload file if exists
      if (file) {
        mediaData = await uploadFile();
      }

      // Create post
      const postData = {
        content,
        media: mediaData ? {
          url: mediaData.url,
          type: mediaData.type
        } : {
          url: '',
          type: 'none'
        }
      };

      const response = await postAPI.createPost(postData);
      
      // Reset form
      setContent('');
      setFile(null);
      setPreview(null);
      setMediaType(null);
      setUploadProgress(0);
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Create Post</h3>
      
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            className="form-control"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="3"
            required
          />
        </div>

        {/* File Upload Area */}
        {!preview && (
          <div className="file-upload-container" onClick={() => document.getElementById('file-input').click()}>
            <div className="file-upload-icon">📷</div>
            <div className="file-upload-text">Add Photo or Video</div>
            <div className="file-upload-hint">or drag and drop</div>
            <input
              id="file-input"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            {mediaType === 'image' ? (
              <img src={preview} alt="Preview" className="media-preview" />
            ) : (
              <video src={preview} controls className="media-preview" />
            )}
            <button
              type="button"
              onClick={handleRemoveFile}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Uploading... {uploadProgress}%
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || uploading}
          style={{ width: '100%' }}
        >
          {loading ? 'Posting...' : uploading ? 'Uploading...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;