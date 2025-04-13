import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (user.role === 'placement') {
        navigate('/placement/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="home-container">
      <h1>Welcome to College Utility System</h1>
      <p>A comprehensive platform for managing college resources and activities.</p>
      
      {user ? (
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      ) : (
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home; 