import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav>
      <ul>
        <li>
          <Link to="/jobs" className={location.pathname === '/jobs' ? 'active' : ''}>
            Jobs
          </Link>
        </li>
        {user && user.role === 'student' && (
          <li>
            <Link 
              to="/my-applications" 
              className={location.pathname === '/my-applications' ? 'active' : ''}
            >
              My Applications
            </Link>
          </li>
        )}
        {user && (user.role === 'placement' || user.role === 'admin') && (
          <li>
            <Link 
              to="/jobs/create" 
              className={location.pathname === '/jobs/create' ? 'active' : ''}
            >
              Post Job
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar; 