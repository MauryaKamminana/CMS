import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Profile() {
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  });
  const [loading, setLoading] = useState(false);

  const { name, email } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const res = await axios.put('/api/users/profile', formData);
      
      if (res.data.success) {
        setUser({
          ...user,
          name: res.data.data.name,
          email: res.data.data.email
        });
        
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Error updating profile');
    }
    
    setLoading(false);
  };

  return (
    <div className="profile">
      <h1>Your Profile</h1>
      <div className="profile-content">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              value={user.role}
              disabled
              className="disabled-input"
            />
            <small>Your role can only be changed by an administrator</small>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile; 