import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  
  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get token from URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }
        
        // Login with token
        const success = await loginWithToken(token);
        
        if (success) {
          toast.success('Login successful');
          navigate('/dashboard');
        } else {
          toast.error('Authentication failed');
          navigate('/login');
        }
      } catch (error) {
        console.error('Google auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };
    
    handleGoogleCallback();
  }, [location, loginWithToken, navigate]);
  
  return (
    <div className="auth-success">
      <h2>Authenticating...</h2>
      <p>Please wait while we complete your login.</p>
    </div>
  );
}

export default AuthSuccess; 