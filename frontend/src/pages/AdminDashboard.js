import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChangeRoleModal from "../components/modals/ChangeRoleModal";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users");
      setUsers(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch users");
      setLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
  };

  const closeRoleModal = () => {
    setSelectedUser(null);
    setSelectedRole("");
  };

  const updateUserRole = async () => {
    try {
      const res = await axios.put(`/api/users/${selectedUser._id}`, {
        role: selectedRole,
      });

      if (res.data.success) {
        // Update the user in the state
        setUsers(
          users.map((u) =>
            u._id === selectedUser._id ? { ...u, role: selectedRole } : u
          )
        );

        toast.success(
          `Role updated to ${selectedRole} for ${selectedUser.name}`
        );
        closeRoleModal();
      }
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await axios.delete(`/api/users/${userId}`);

        if (res.data.success) {
          // Remove user from list
          setUsers(users.filter((user) => user._id !== userId));
          toast.success("User deleted successfully");
        }
      } catch (error) {
        toast.error("Error deleting user");
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p style={{ paddingBottom: "20px" }}>Welcome, {user.name}!</p>

      <div className="admin-dashboard-highlight">
        <h2>Course Management System</h2>
        <p>Create courses, assign faculty, and enroll students</p>
        <div className="highlight-actions">
          <Link to="/admin/courses" className="btn btn-lg btn-primary">
            Manage Courses
          </Link>
          <Link to="/admin/users" className="btn btn-lg btn-secondary">
            Manage Users
          </Link>
        </div>
      </div>

      <div className="admin-menu">
        <div className="admin-menu-item">
          <h3>Course Management</h3>
          <p>Create and manage courses, assign faculty and students</p>
          <Link to="/admin/courses" className="btn btn-primary">
            Manage Courses
          </Link>
        </div>

        <div className="admin-menu-item">
          <h3>User Management</h3>
          <p>Manage users, update roles, and handle enrollments</p>
          <Link to="/admin/users" className="btn btn-primary">
            Manage Users
          </Link>
        </div>

        <div className="admin-menu-item">
          <h3>Academic Resources</h3>
          <p>Manage learning materials and resources</p>
          <Link to="/resources" className="btn btn-primary">
            Manage Resources
          </Link>
        </div>

        <div className="admin-menu-item">
          <h3>Assignments</h3>
          <p>Oversee assignments and submissions</p>
          <Link to="/assignments" className="btn btn-primary">
            Manage Assignments
          </Link>
        </div>

        <div className="admin-menu-item">
          <h3>Attendance</h3>
          <p>Monitor attendance records</p>
          <Link to="/attendance" className="btn btn-primary">
            View Attendance
          </Link>
        </div>

        <div className="admin-menu-item">
          <h3>Announcements</h3>
          <p>Create and manage announcements</p>
          <Link to="/announcements" className="btn btn-primary">
            Manage Announcements
          </Link>
        </div>

        <div className="admin-menu-item">
          <h3>Approve Users</h3>
          <p>Grant access to out of organization users</p>
          <Link to="/approve/new-users" className="btn btn-primary">
            Give Access
          </Link>
        </div>
      </div>

      <div className="admin-content">
        <h2>User Management</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="user-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-small btn-outline"
                          onClick={() => openRoleModal(user)}
                        >
                          Change Role
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => deleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <ChangeRoleModal
          user={selectedUser}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          onClose={closeRoleModal}
          onUpdate={updateUserRole}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
