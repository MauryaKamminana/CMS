import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/jobApplication.css';

function JobApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cgpa: '',
    degree: '',
    batch: '',
    skills: '',
    experience: '',
    coverLetter: '',
    resumeLink: ''
  });
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/jobs/${id}`);
        
        if (response.data.success) {
          setJob(response.data.data);
          
          // Check if user has already applied
          if (user && response.data.data.applicants) {
            const hasApplied = response.data.data.applicants.some(
              app => app.student._id === user._id || app.student === user._id
            );
            
            if (hasApplied) {
              toast.error('You have already applied for this job');
              navigate(`/jobs/${id}`);
              return;
            }
          }
          
          // Pre-fill form with user profile data if available
          if (user && user.profile) {
            setFormData(prev => ({
              ...prev,
              cgpa: user.profile.cgpa || '',
              degree: user.profile.degree || '',
              batch: user.profile.batch || '',
              skills: user.profile.skills || '',
              resumeLink: user.profile.resumeLink || ''
            }));
          }
        } else {
          toast.error('Failed to load job details');
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Error loading job details');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id, user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // First, update the user profile with the provided information
      const profileResponse = await axios.put('/api/users/profile', {
        cgpa: formData.cgpa,
        degree: formData.degree,
        batch: formData.batch,
        skills: formData.skills,
        resumeLink: formData.resumeLink
      });
      
      if (!profileResponse.data.success) {
        toast.error('Failed to update profile information');
        return;
      }
      
      // Then, apply for the job with the additional information
      const applicationResponse = await axios.post(`/api/jobs/${id}/apply`, {
        experience: formData.experience,
        coverLetter: formData.coverLetter
      });
      
      if (applicationResponse.data.success) {
        toast.success('Application submitted successfully');
        navigate(`/jobs/${id}`);
      } else {
        toast.error(applicationResponse.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      
      // More specific error handling
      if (error.response) {
        if (error.response.status === 403) {
          toast.error('Permission denied. You may not have the right permissions.');
        } else if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Error submitting application');
        }
      } else {
        toast.error('Network error. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading application form...</div>;
  }
  
  if (!job) {
    return <div className="error-message">Job not found</div>;
  }
  
  return (
    <div className="job-application-container">
      <h1>Apply for {job.title}</h1>
      <div className="job-info">
        <h2>{job.company}</h2>
        <p className="job-location">{job.location}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-section">
          <h3>Academic Information</h3>
          
          <div className="form-group">
            <label htmlFor="cgpa">CGPA*</label>
            <input
              type="number"
              id="cgpa"
              name="cgpa"
              value={formData.cgpa}
              onChange={handleChange}
              required
              min="0"
              max="10"
              step="0.01"
              placeholder="Enter your CGPA (e.g., 8.5)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="degree">Degree/Program*</label>
            <input
              type="text"
              id="degree"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              placeholder="e.g., B.Tech Computer Science"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="batch">Batch/Graduation Year*</label>
            <input
              type="text"
              id="batch"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              required
              placeholder="e.g., 2023"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Professional Information</h3>
          
          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., JavaScript, React, Node.js"
            />
            <small>Separate skills with commas</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="experience">Relevant Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Describe your relevant experience..."
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="resumeLink">Resume Link</label>
            <input
              type="url"
              id="resumeLink"
              name="resumeLink"
              value={formData.resumeLink}
              onChange={handleChange}
              placeholder="e.g., https://drive.google.com/file/your-resume"
            />
            <small>Link to your resume (Google Drive, Dropbox, etc.)</small>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Cover Letter</h3>
          
          <div className="form-group">
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              placeholder="Write your cover letter here..."
              rows="6"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/jobs/${id}`)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobApplication; 