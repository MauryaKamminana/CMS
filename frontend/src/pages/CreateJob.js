import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import '../styles/createJob.css';

function CreateJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    jobType: 'Full-time',
    applicationDeadline: '',
    applicationProcess: '',
    applicationLink: '',
    contactEmail: '',
    contactPhone: '',
    status: 'Open',
    eligibility: {
      degrees: [],
      cgpa: '',
      batch: [],
      additionalCriteria: ''
    }
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [degree, setDegree] = useState('');
  const [batch, setBatch] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleAddDegree = () => {
    if (degree.trim() && !formData.eligibility.degrees.includes(degree.trim())) {
      setFormData(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          degrees: [...prev.eligibility.degrees, degree.trim()]
        }
      }));
      setDegree('');
    }
  };
  
  const handleRemoveDegree = (index) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        degrees: prev.eligibility.degrees.filter((_, i) => i !== index)
      }
    }));
  };
  
  const handleAddBatch = () => {
    if (batch.trim() && !formData.eligibility.batch.includes(batch.trim())) {
      setFormData(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          batch: [...prev.eligibility.batch, batch.trim()]
        }
      }));
      setBatch('');
    }
  };
  
  const handleRemoveBatch = (index) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        batch: prev.eligibility.batch.filter((_, i) => i !== index)
      }
    }));
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };
  
  const uploadAttachments = async () => {
    if (attachments.length === 0) return [];
    
    setUploading(true);
    const uploadedAttachments = [];
    
    try {
      for (const file of attachments) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          uploadedAttachments.push({
            name: file.name,
            url: response.data.url,
            type: file.type
          });
        }
      }
      
      return uploadedAttachments;
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast.error('Error uploading attachments');
      return [];
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.company || !formData.description || 
        !formData.requirements || !formData.location || !formData.jobType || 
        !formData.applicationDeadline || !formData.applicationProcess) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Upload attachments first
      const uploadedAttachments = await uploadAttachments();
      
      // Convert CGPA to number if provided
      const dataToSubmit = {
        ...formData,
        eligibility: {
          ...formData.eligibility,
          cgpa: formData.eligibility.cgpa ? parseFloat(formData.eligibility.cgpa) : undefined
        },
        attachments: uploadedAttachments
      };
      
      const response = await axios.post('/api/jobs', dataToSubmit);
      
      if (response.data.success) {
        toast.success('Job posted successfully');
        navigate(`/jobs/${response.data.data._id}`);
      } else {
        toast.error(response.data.message || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(error.response?.data?.message || 'Error posting job');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="create-job-container">
      <h1>Post a New Job</h1>
      
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Job Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength="100"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="company">Company Name*</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              maxLength="100"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location*</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="salary">Salary (Optional)</label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jobType">Job Type*</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status*</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="applicationDeadline">Application Deadline*</label>
            <input
              type="date"
              id="applicationDeadline"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Job Details</h2>
          
          <div className="form-group">
            <label htmlFor="description">Job Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              maxLength="5000"
              placeholder="Provide a detailed description of the job role, responsibilities, and expectations."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="requirements">Job Requirements*</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              rows="6"
              maxLength="2000"
              placeholder="List the skills, qualifications, and experience required for this position."
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Eligibility Criteria</h2>
          
          <div className="form-group">
            <label>Eligible Degrees</label>
            <div className="tag-input">
              <div className="tag-input-row">
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g., B.Tech Computer Science"
                />
                <button type="button" onClick={handleAddDegree} className="btn-add">
                  Add
                </button>
              </div>
              
              <div className="tags-container">
                {formData.eligibility.degrees.map((deg, index) => (
                  <div key={index} className="tag">
                    {deg}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveDegree(index)}
                      className="btn-remove"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="eligibility.cgpa">Minimum CGPA</label>
            <input
              type="number"
              id="eligibility.cgpa"
              name="eligibility.cgpa"
              value={formData.eligibility.cgpa}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g., 7.5"
            />
          </div>
          
          <div className="form-group">
            <label>Eligible Batches</label>
            <div className="tag-input">
              <div className="tag-input-row">
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="e.g., 2023-2027"
                />
                <button type="button" onClick={handleAddBatch} className="btn-add">
                  Add
                </button>
              </div>
              
              <div className="tags-container">
                {formData.eligibility.batch.map((b, index) => (
                  <div key={index} className="tag">
                    {b}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveBatch(index)}
                      className="btn-remove"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="eligibility.additionalCriteria">Additional Criteria</label>
            <textarea
              id="eligibility.additionalCriteria"
              name="eligibility.additionalCriteria"
              value={formData.eligibility.additionalCriteria}
              onChange={handleChange}
              rows="3"
              placeholder="Any additional eligibility requirements"
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Application Details</h2>
          
          <div className="form-group">
            <label htmlFor="applicationProcess">Application Process*</label>
            <textarea
              id="applicationProcess"
              name="applicationProcess"
              value={formData.applicationProcess}
              onChange={handleChange}
              required
              rows="4"
              maxLength="1000"
              placeholder="Describe the application process, interview rounds, etc."
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="applicationLink">Application Link (Optional)</label>
            <input
              type="url"
              id="applicationLink"
              name="applicationLink"
              value={formData.applicationLink}
              onChange={handleChange}
              placeholder="e.g., https://company.com/careers/job123"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="e.g., careers@company.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactPhone">Contact Phone</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="e.g., +1 (123) 456-7890"
              />
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Attachments</label>
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange}
            className="file-input"
            disabled={uploading}
          />
          <small>Upload job description, company brochure, or other relevant documents</small>
          {uploading && <div className="upload-indicator">Uploading files...</div>}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={submitting}
          >
            {submitting ? 'Posting...' : 'Post Job'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate('/jobs')}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateJob; 