import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function EditResource() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    resourceType: '',
    fileUrl: '',
    externalLink: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const { title, description, course, resourceType, fileUrl, externalLink } = formData;

  const fetchResource = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/resources/${id}`);
      
      const resourceData = res.data.data;
      setFormData({
        title: resourceData.title,
        description: resourceData.description,
        course: resourceData.course,
        resourceType: resourceData.resourceType,
        fileUrl: resourceData.fileUrl || '',
        externalLink: resourceData.externalLink || ''
      });
      
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching resource');
      navigate('/resources');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchResource();
  }, [fetchResource]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !course || !resourceType) {
      return toast.error('Please fill all required fields');
    }
    
    if (resourceType === 'document' && !fileUrl) {
      return toast.error('Please provide a file URL for document resources');
    }
    
    if (resourceType === 'video' && !fileUrl) {
      return toast.error('Please provide a video URL');
    }
    
    if (resourceType === 'link' && !externalLink) {
      return toast.error('Please provide an external link');
    }
    
    setSubmitting(true);
    
    try {
      await axios.put(`/api/resources/${id}`, formData);
      toast.success('Resource updated successfully');
      navigate(`/resources/${id}`);
    } catch (error) {
      toast.error('Error updating resource');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return <p>Loading resource...</p>;
  }

  return (
    <div className="edit-resource">
      <h1>Edit Resource</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="Enter resource title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            placeholder="Enter resource description"
            required
            rows="5"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="course">Course*</label>
          <select
            id="course"
            name="course"
            value={course}
            onChange={onChange}
            required
          >
            <option value="">Select Course</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Biology">Biology</option>
            <option value="Chemistry">Chemistry</option>
            <option value="English">English</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="resourceType">Resource Type*</label>
          <select
            id="resourceType"
            name="resourceType"
            value={resourceType}
            onChange={onChange}
            required
          >
            <option value="">Select Type</option>
            <option value="document">Document</option>
            <option value="video">Video</option>
            <option value="link">External Link</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {(resourceType === 'document' || resourceType === 'video') && (
          <div className="form-group">
            <label htmlFor="fileUrl">File URL*</label>
            <input
              type="text"
              id="fileUrl"
              name="fileUrl"
              value={fileUrl}
              onChange={onChange}
              placeholder={resourceType === 'document' ? "Enter document URL" : "Enter video URL"}
              required
            />
          </div>
        )}
        
        {resourceType === 'link' && (
          <div className="form-group">
            <label htmlFor="externalLink">External Link*</label>
            <input
              type="text"
              id="externalLink"
              name="externalLink"
              value={externalLink}
              onChange={onChange}
              placeholder="Enter external link"
              required
            />
          </div>
        )}
        
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Resource'}
        </button>
      </form>
    </div>
  );
}

export default EditResource; 