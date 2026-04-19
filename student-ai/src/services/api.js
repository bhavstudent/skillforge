const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('skillforge_token');
  const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  return fetch(url, config);
};

export default API_URL;
