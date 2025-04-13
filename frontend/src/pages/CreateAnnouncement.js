import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function CreateAnnouncement() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    important: false
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const { title, content, category, important } = formData;

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      return toast.error('Please fill in all required fields');
    }
    
    setLoading(true);
    
    try {
      await axios.post('/api/announcements', formData);
      toast.success('Announcement created successfully');
      navigate('/announcements');
    } catch (error) {
      toast.error('Error creating announcement');
    }
    
    setLoading(false);
  };

  return (
    <div className="create-announcement">
      <h1>Create Announcement</h1>
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
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Announcement'}
        </button>
      </form>
    </div>
  );
}

export default CreateAnnouncement; 