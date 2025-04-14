import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/ApproveUsers.css";

const ApproveUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    // Fetch pending users from an API or backend
    const fetchPendingUsers = async () => {
      try {
        const response = await axios.get(
          "/api/users/userWithStatus?status=pending"
        );
        const data = await response.data.data;
        setPendingUsers(data);
      } catch (error) {
        console.error("Error fetching pending users:", error);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId, email) => {
    try {
      const response = await axios.post("/api/auth/admin/approve", {
        email,
      });

      if (response.ok) {
        setPendingUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
      } else {
        console.error("Failed to approve user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  return (
    <div className="approve-users-container">
      <h1>Pending Users</h1>
      {pendingUsers.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <div className="user-list">
          {pendingUsers.map((user) => (
            <div key={user._id || user.email} className="user-card">
              <div className="avatar-placeholder">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
              <button
                className="approve-button"
                onClick={() => handleApprove(user._id, user.email)}
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveUsers;
