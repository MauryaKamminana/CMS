import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function EditLostItem() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    status: '',
    contactInfo: '',
    image: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const { title, description, category, location, date, status, contactInfo, image } = formData;

  const fetchLostItem = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/lost-items/${id}`);
      const item = res.data.data;
      
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        date: new Date(item.date).toISOString().split('T')[0],
        status: item.status,
        contactInfo: item.contactInfo,
        image: item.image || ''
      });
      
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching item details');
      setLoading(false);
      navigate('/lost-items');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLostItem();
  }, [fetchLostItem]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !location || !date || !contactInfo) {
      return toast.error('Please fill in all required fields');
    }
    
    setSubmitting(true);
    
    try {
      await axios.put(`/api/lost-items/${id}`, formData);
      toast.success('Item updated successfully');
      navigate(`/lost-items/${id}`);
    } catch (error) {
      toast.error('Error updating item');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return <p>Loading item details...</p>;
  }

  return (
    <div className="edit-lost-item">
      <h1>Edit Lost or Found Item</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="Enter a descriptive title"
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
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Documents">Documents</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={onChange}
            required
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
            <option value="returned">Returned</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={location}
            onChange={onChange}
            placeholder="Where was the item lost/found?"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contactInfo">Contact Information</label>
          <input
            type="text"
            id="contactInfo"
            name="contactInfo"
            value={contactInfo}
            onChange={onChange}
            placeholder="Phone number or email"
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
            placeholder="Provide detailed description of the item"
            rows="6"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL (optional)</label>
          <input
            type="text"
            id="image"
            name="image"
            value={image}
            onChange={onChange}
            placeholder="URL to an image of the item"
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Item'}
        </button>
      </form>
    </div>
  );
}

export default EditLostItem; 