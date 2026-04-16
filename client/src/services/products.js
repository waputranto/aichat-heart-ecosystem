/**
 * Product API Service
 * Handles all product-related API calls
 */

import api from './api';

export const productService = {
  /**
   * Get all products
   */
  async getAll() {
    const response = await api.get('/products');
    return response.data || [];
  },

  /**
   * Get a single product by ID
   */
  async getById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Get products with low stock (stock alert)
   * @param {number} threshold - Stock threshold (default: 5)
   */
  async getStockAlert(threshold = 5) {
    const response = await api.get(`/products/stock-alert?threshold=${threshold}`);
    return response.data || [];
  },

  /**
   * Create a new product
   * @param {Object} product - Product data { name, price, stock, description }
   */
  async create(product) {
    const response = await api.post('/products', product);
    return response.data;
  },

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} updates - Partial product data
   */
  async update(id, updates) {
    const response = await api.put(`/products/${id}`, updates);
    return response.data;
  },

  /**
   * Update product stock
   * @param {string} id - Product ID
   * @param {number} stock - New stock value
   */
  async updateStock(id, stock) {
    const response = await api.patch(`/products/${id}/stock`, { stock });
    return response.data;
  },

  /**
   * Delete a product
   * @param {string} id - Product ID
   */
  async delete(id) {
    await api.delete(`/products/${id}`);
  },
};

export default productService;
