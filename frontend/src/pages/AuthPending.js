import React from "react";
import "../styles/AuthPending.css";

const AuthPending = () => {
  return (
    <div className="auth-pending-container">
      <div className="auth-pending-card">
        <div className="icon">⏳</div>
        <h1>Access Pending</h1>
        <p>Your login is awaiting approval from the admin.</p>
        <p>It seems you are not yet a part of the organization.</p>
        <p className="subtle">
          Please contact your administrator for further assistance.
        </p>
      </div>
    </div>
  );
};

export default AuthPending;
