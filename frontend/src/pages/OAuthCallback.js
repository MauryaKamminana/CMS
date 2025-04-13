import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token from URL query params
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
          // Save token to localStorage
          localStorage.setItem('token', token);
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const res = await axios.get('/api/auth/me');
          
          if (res.data.success) {
            setUser(res.data.user);
            toast.success('Successfully logged in!');
            navigate('/dashboard');
          } else {
            toast.error('Authentication failed');
            navigate('/login');
          }
        } else {
          toast.error('Authentication failed');
          navigate('/login');
        }
      } catch (error) {
        toast.error('Authentication failed');
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [location, navigate, setUser]);

  return (
    <div className="oauth-callback">
      <h2>Authenticating...</h2>
      <p>Please wait while we complete the authentication process.</p>
    </div>
  );
}

export default OAuthCallback; 