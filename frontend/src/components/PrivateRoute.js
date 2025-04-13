import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Special handling for placement role - allow admin and placement officers to access placement routes
  if (role === 'placement' && (user.role === 'admin' || user.role === 'placement')) {
    return typeof children === 'function' ? children({ user }) : children;
  }

  // Regular role checking
  if (role && user.role !== role && 
      !(user.role === 'admin' && role !== 'student')) {
    return <Navigate to="/dashboard" replace />;
  }

  return typeof children === 'function' ? children({ user }) : children;
};

export default PrivateRoute; 