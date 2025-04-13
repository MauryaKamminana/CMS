import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function EditAnnouncement() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    important: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const { title, content, category, important } = formData;

  const fetchAnnouncement = useCallback(async () => {
    try {
      const res = await axios.get(`/api/announcements/${id}`);
      setFormData({
        title: res.data.data.title,
        content: res.data.data.content,
        category: res.data.data.category,
        important: res.data.data.important
      });
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching announcement');
      navigate('/announcements');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      return toast.error('Please fill in all required fields');
    }
    
    setSubmitting(true);
    
    try {
      await axios.put(`/api/announcements/${id}`, formData);
      toast.success('Announcement updated successfully');
      navigate(`/announcements/${id}`);
    } catch (error) {
      toast.error('Error updating announcement');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return <p>Loading announcement...</p>;
  }

  return (
    <div className="edit-announcement">
      <h1>Edit Announcement</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="Enter announcement title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={onChange}
            required
          >
            <option value="Academic">Academic</option>
            <option value="Event">Event</option>
            <option value="Placement">Placement</option>
            <option value="General">General</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={onChange}
            placeholder="Enter announcement content"
            rows="10"
            required
          ></textarea>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="important"
            name="important"
            checked={important}
            onChange={onChange}
          />
          <label htmlFor="important">Mark as Important</label>
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Announcement'}
        </button>
      </form>
    </div>
  );
}

export default EditAnnouncement; 