/**
 * User/Auth API Service
 * Handles user registration and profile management
 */

import api from './api';

export const userService = {
  /**
   * Register a new user
   * @param {Object} credentials - { username, password }
   */
  async register(credentials) {
    const response = await api.post('/users', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   * @param {string} userId - User ID
   */
  async getProfile(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Store user ID in localStorage (mock auth)
   * @param {string} userId - User ID
   */
  setCurrentUser(userId) {
    localStorage.setItem('userId', userId);
  },

  /**
   * Get current user ID from localStorage
   */
  getCurrentUser() {
    return localStorage.getItem('userId');
  },

  /**
   * Clear current user session
   */
  logout() {
    localStorage.removeItem('userId');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  },
};

export default userService;
