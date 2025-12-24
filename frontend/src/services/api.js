import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.delete(`/users/${id}/follow`),
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
};

export const postAPI = {
  createPost: (data) => api.post('/posts', data),
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  getPost: (id) => api.get(`/posts/${id}`),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
};

export const commentAPI = {
  addComment: (postId, data) => api.post(`/comments/${postId}`, data),
  getComments: (postId) => api.get(`/comments/${postId}`),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export default api;