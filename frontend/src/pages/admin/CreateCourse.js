import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import '../../styles/admin.css';

function CreateCourse() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !code || !description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Log the request for debugging
      console.log('Sending course creation request with data:', {
        name,
        code,
        description
      });
      
      // Make sure we're using the correct endpoint
      const res = await axios.post('/api/courses', {
        name,
        code,
        description
      });
      
      console.log('Course creation response:', res.data);
      
      if (res.data.success) {
        toast.success('Course created successfully');
        
        // Force a refresh when navigating back by adding a timestamp parameter
        navigate('/admin/courses?refresh=' + new Date().getTime());
      } else {
        toast.error(res.data.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      
      // More detailed error handling
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // Show specific error message if available
        toast.error(error.response.data?.message || 'Error creating course');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        toast.error('Error setting up request: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-page">
      <div className="form-container">
        <h1>Create New Course</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Course Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter course name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="code">Course Code</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter course code"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
              rows="4"
              required
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin/courses')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse; 