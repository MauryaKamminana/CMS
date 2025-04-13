import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import '../../styles/admin.css';

function EditCourse() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const { name, code, description } = formData;

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching course with ID:', id);
      
      const res = await axios.get(`/api/courses/${id}`);
      
      if (res.data.success) {
        console.log('Course data received:', res.data.data);
        setFormData({
          name: res.data.data.name,
          code: res.data.data.code,
          description: res.data.data.description
        });
      } else {
        toast.error('Failed to load course');
        navigate('/admin/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error(error.response?.data?.message || 'Error fetching course');
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !code || !description) {
      return toast.error('Please fill all required fields');
    }
    
    try {
      setSubmitting(true);
      
      const res = await axios.put(`/api/courses/${id}`, formData);
      
      if (res.data.success) {
        toast.success('Course updated successfully');
        navigate('/admin/courses');
      } else {
        toast.error(res.data.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.message || 'Error updating course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="form-container">
        <h1>Edit Course</h1>
        
        {loading ? (
          <p className="text-center">Loading course...</p>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name">Course Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="Enter course name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="code">Course Code</label>
              <input
                type="text"
                id="code"
                name="code"
                value={code}
                onChange={onChange}
                placeholder="Enter course code"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={onChange}
                placeholder="Enter course description"
                rows="4"
                required
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Course'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/admin/courses')}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditCourse; 