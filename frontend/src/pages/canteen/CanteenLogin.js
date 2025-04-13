import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import '../../styles/canteen/canteenLogin.css';

function CanteenLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    if (user) {
      redirectBasedOnRole(user.role);
    }
  }, [user]);
  
  const redirectBasedOnRole = (role) => {
    if (role === 'admin') {
      navigate('/canteen/admin/dashboard');
    } else {
      navigate('/canteen/dashboard');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/auth/login', credentials);
      
      if (response.data.success) {
        // Store the token and user info
        login(response.data.token, response.data.user);
        
        toast.success('Login successful!');
        
        // Redirect based on user role
        redirectBasedOnRole(response.data.user.role);
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'An error occurred during login');
    }
  };
  
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };
  
  return (
    <div className="canteen-login-container">
      <div className="canteen-login-card">
        <div className="canteen-login-header">
          <h1>Canteen Login</h1>
          <p>Sign in to access the canteen services</p>
        </div>
        
        <form onSubmit={handleSubmit} className="canteen-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="btn-login">
            Login
          </button>
        </form>
        
        <div className="social-login">
          <p>Or sign in with:</p>
          <button onClick={handleGoogleLogin} className="btn-google">
            Google
          </button>
        </div>
        
        <div className="canteen-login-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
          <p>
            <Link to="/">Back to Main Site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CanteenLogin; 