import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const reviewsAPI = {
  // Get all reviews with stats
  getReviews: async () => {
    const response = await api.get('/webhooks/reviews');
    return response.data;
  },

  // Get a specific review
  getReview: async (owner, repo, pullNumber) => {
    const response = await api.get(`/webhooks/reviews/${owner}/${repo}/${pullNumber}`);
    return response.data;
  },

  // Trigger manual review
  triggerReview: async (owner, repo, pullNumber) => {
    const response = await api.post('/webhooks/reviews/trigger', {
      owner,
      repo,
      pullNumber: parseInt(pullNumber)
    });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/webhooks/health');
    return response.data;
  }
};

export default api;

// Made with Bob
