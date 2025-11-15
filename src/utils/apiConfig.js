/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Use local json-server for development
export const API_BASE_URL = 'http://localhost:3001';

/**
 * Helper function to construct full API URLs
 * @param {string} endpoint - The API endpoint path
 * @returns {string} Full URL with base and endpoint
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  getApiUrl
};