import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  
  const isAdmin = user && user.role === 'admin';
  const isFaculty = user && (user.role === 'faculty' || user.role === 'admin');

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="user-info">
        <h2>Welcome, {user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        
        <div className="profile-actions">
          <Link to="/profile" className="btn btn-primary">
            Edit Profile
          </Link>
          
          {isAdmin && (
            <Link to="/admin" className="btn btn-secondary">
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* Course Management - Visible to all but with role-specific actions */}
        <div className="dashboard-card">
          <h3>Course Management</h3>
          <p>{isAdmin ? 'Create and manage courses' : isFaculty ? 'Manage your assigned courses' : 'View your enrolled courses'}</p>
          
          {isAdmin && (
            <Link to="/admin/courses" className="btn btn-primary">
              Manage Courses
            </Link>
          )}
          
          {isFaculty && !isAdmin && (
            <Link to="/faculty/dashboard" className="btn btn-primary">
              My Courses
            </Link>
          )}
          
          {!isFaculty && (
            <Link to="/student/dashboard" className="btn btn-primary">
              My Courses
            </Link>
          )}
        </div>
        
        <div className="dashboard-card">
          <h3>Announcements</h3>
          <p>View and manage college announcements</p>
          <Link to="/announcements" className="btn btn-primary">
            Go to Announcements
          </Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Lost & Found</h3>
          <p>Report lost items or check found items</p>
          <Link to="/lost-items" className="btn btn-primary">
            Go to Lost & Found
          </Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Assignments</h3>
          <p>View and submit assignments</p>
          <Link to="/assignments" className="btn btn-primary">
            Go to Assignments
          </Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Attendance</h3>
          <p>Check your attendance</p>
          <Link to="/attendance" className="btn btn-primary">
            View Attendance
          </Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Academic Resources</h3>
          <p>Access academic resources</p>
          <Link to="/resources" className="btn btn-primary">
            Go to Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 