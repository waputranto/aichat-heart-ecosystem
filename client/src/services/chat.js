/**
 * Chat/AI Service
 * Handles chat history and AI response generation
 */

import api from './api';

export const chatService = {
  /**
   * Send a message to AI and get response
   * @param {string} userId - User ID
   * @param {string} message - User message
   */
  async sendMessage(userId, message) {
    const response = await api.post('/ai/chat', {
      userId,
      message,
    });
    return response.data;
  },

  /**
   * Get chat history
   * @param {string} userId - Optional: filter by user ID
   */
  async getHistory(userId = null) {
    const endpoint = userId ? `/chats?userId=${userId}` : '/chats';
    const response = await api.get(endpoint);
    return response.data || [];
  },

  /**
   * Get chat history for current user
   */
  async getUserChatHistory(userId) {
    return this.getHistory(userId);
  },
};

export default chatService;
