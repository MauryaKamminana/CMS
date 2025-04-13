import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base URL
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else {
      console.log('No token available for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error:', error.response.data);
      
      // Only show toast and redirect if it's not a login/register request
      if (!error.config.url.includes('/auth/')) {
        toast.error('Your session has expired. Please log in again.');
        
        // Clear token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    // Handle forbidden errors
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || 'You do not have permission to access this resource.';
      toast.error(message);
      
      // Log detailed information for debugging
      console.log('Permission denied:', {
        url: error.config.url,
        method: error.config.method,
        status: error.response.status,
        message: error.response.data?.message,
        requiredRoles: error.response.data?.requiredRoles,
        userRole: error.response.data?.userRole
      });
    }
    
    // Handle server errors
    if (error.response && error.response.status === 500) {
      console.error('Server error:', error.response.data);
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default instance; 