import React from 'react';

function ChangeRoleModal({ user, selectedRole, setSelectedRole, onClose, onUpdate }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Change User Role</h2>
        <p>
          Change role for user: <strong>{user.name}</strong>
        </p>
        <div className="form-group">
          <label htmlFor="role">Select Role:</label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
            <option value="placement">Placement Officer</option>
          </select>
        </div>
        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={onUpdate}
          >
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangeRoleModal; 