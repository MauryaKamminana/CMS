import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  // Get the correct dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'faculty':
        return '/faculty/dashboard';
      case 'placement':
        return '/placement/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">College Utility System</Link>
        </div>
        <nav>
          <ul>
            {user ? (
              <>
                <li>
                  <Link to={getDashboardLink()}>Dashboard</Link>
                </li>
                <li>
                  <Link to="/announcements">Announcements</Link>
                </li>
                {user.role === 'student' && (
                  <>
                    <li>
                      <Link to="/jobs">Jobs</Link>
                    </li>
                  </>
                )}
                {(user.role === 'faculty' || user.role === 'admin') && (
                  <>
                    <li>
                      <Link to="/courses">Courses</Link>
                    </li>
                  </>
                )}
                {(user.role === 'placement' || user.role === 'admin') && (
                  <>
                    <li>
                      <Link to="/jobs">Jobs</Link>
                    </li>
                    <li>
                      <Link to="/jobs/create">Post Job</Link>
                    </li>
                  </>
                )}
                {user.role === 'admin' && (
                  <li>
                    <Link to="/admin">Admin</Link>
                  </li>
                )}
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                {user && user.role === 'admin' && (
                  <li>
                    <Link to="/canteen/admin/dashboard">Canteen Admin</Link>
                  </li>
                )}
                {user && (
                  <li>
                    <Link to="/canteen/dashboard">Canteen</Link>
                  </li>
                )}
                <li>
                  <button onClick={onLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header; 