import React from "react";

const AuthFailure = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Login Failed</h1>
      <p>
        Sorry, we couldn't log you in. Please check your credentials and try
        again.
      </p>
      <button
        onClick={() => (window.location.href = "/login")}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Go to Login
      </button>
    </div>
  );
};

export default AuthFailure;
