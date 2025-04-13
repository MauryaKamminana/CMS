import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      
      <div className="admin-menu">
        <div className="admin-menu-item">
          <h3>User Management</h3>
          <Link to="/admin/users" className="btn btn-primary">
            Manage Users
          </Link>
        </div>
        
        <div className="admin-menu-item">
          <h3>Course Management</h3>
          <Link to="/admin/courses" className="btn btn-primary">
            Manage Courses
          </Link>
        </div>
        
        <div className="admin-menu-item">
          <h3>Academic Resources</h3>
          <Link to="/admin/resources" className="btn btn-primary">
            Manage Resources
          </Link>
        </div>
        
        <div className="admin-menu-item">
          <h3>Assignments</h3>
          <Link to="/admin/assignments" className="btn btn-primary">
            Manage Assignments
          </Link>
        </div>
        
        <div className="admin-menu-item">
          <h3>Attendance</h3>
          <Link to="/admin/attendance" className="btn btn-primary">
            View Attendance
          </Link>
        </div>
        
        <div className="admin-menu-item">
          <h3>Canteen Management</h3>
          <Link to="/canteen/admin/dashboard" className="btn btn-primary">
            Manage Canteen
          </Link>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>Canteen Management</h3>
        </div>
        <div className="card-body">
          <p>Manage canteen products and orders</p>
          <div className="action-buttons">
            <Link to="/canteen/admin/dashboard" className="btn btn-primary">
              Canteen Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 