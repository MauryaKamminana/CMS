import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/canteen/canteenNavbar.css';

function CanteenNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/canteen/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <nav className="canteen-navbar">
      <div className="canteen-navbar-brand">
        <Link to={user?.role === 'admin' ? '/canteen/admin/dashboard' : '/canteen/dashboard'}>
          Campus Canteen
        </Link>
      </div>
      
      <div className="canteen-navbar-links">
        {user?.role === 'admin' ? (
          // Admin links
          <>
            <Link to="/canteen/admin/dashboard" className={isActive('/canteen/admin/dashboard')}>
              Dashboard
            </Link>
            <Link to="/canteen/admin/products" className={isActive('/canteen/admin/products')}>
              Products
            </Link>
            <Link to="/canteen/admin/orders" className={isActive('/canteen/admin/orders')}>
              Orders
            </Link>
          </>
        ) : (
          // User links
          <>
            <Link to="/canteen/dashboard" className={isActive('/canteen/dashboard')}>
              Menu
            </Link>
            <Link to="/canteen/orders" className={isActive('/canteen/orders')}>
              My Orders
            </Link>
          </>
        )}
      </div>
      
      <div className="canteen-navbar-user">
        {user ? (
          <>
            <span className="user-name">{user.name}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <Link to="/canteen/login" className="btn-login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default CanteenNavbar; 