import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/jobApplicationForm.css';

function JobApplicationForm() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cgpa: '',
    degree: '',
    batch: '',
    skills: '',
    experience: '',
    coverLetter: '',
    resumeLink: ''
  });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Check if user is logged in and is a student
    if (!user) {
      toast.error('Please login to apply for jobs');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'student') {
      toast.error('Only students can apply for jobs');
      navigate(`/jobs/${id}`);
      return;
    }
    
    // Fetch job details and user profile
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch job details
        const jobResponse = await axios.get(`/api/jobs/${id}`);
        if (jobResponse.data.success) {
          setJob(jobResponse.data.data);
          
          // Check if user has already applied
          try {
            const applicationsRes = await axios.get('/api/jobs/applications');
            if (applicationsRes.data.success) {
              const hasAppliedToThisJob = applicationsRes.data.data.some(
                app => app.job._id === id || app.job === id
              );
              
              if (hasAppliedToThisJob) {
                toast.info('You have already applied for this job');
                navigate(`/jobs/${id}`);
                return;
              }
            }
          } catch (error) {
            console.error('Error checking application status:', error);
          }
        } else {
          toast.error('Failed to load job details');
          navigate('/jobs');
          return;
        }
        
        // Fetch user profile
        const profileResponse = await axios.get('/api/users/profile');
        if (profileResponse.data.success) {
          const profile = profileResponse.data.data;
          
          // Pre-fill form with user data
          setFormData({
            name: user.name || '',
            email: user.email || '',
            cgpa: profile.cgpa || '',
            degree: profile.degree || '',
            batch: profile.batch || '',
            skills: profile.skills ? profile.skills.join(', ') : '',
            experience: '',
            coverLetter: '',
            resumeLink: profile.resumeLink || ''
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading data');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Format skills as array
      const formattedData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      
      const res = await axios.post(`/api/jobs/${id}/apply`, formattedData);
      if (res.data.success) {
        toast.success('Application submitted successfully');
        navigate(`/jobs/${id}`);
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }
  
  if (!job) {
    return <div className="error-message">Job not found</div>;
  }
  
  return (
    <div className="job-application-container">
      <div className="job-application-header">
        <h1>Apply for: {job.title}</h1>
        <h2>{job.company}</h2>
      </div>
      
      <div className="job-application-content">
        <div className="job-summary">
          <h3>Job Summary</h3>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Job Type:</strong> {job.jobType}</p>
          {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
          <p><strong>Application Deadline:</strong> {new Date(job.applicationDeadline).toLocaleDateString()}</p>
          
          {job.eligibility && (
            <div className="eligibility-summary">
              <h4>Eligibility Criteria</h4>
              {job.eligibility.degrees && job.eligibility.degrees.length > 0 && (
                <p><strong>Eligible Degrees:</strong> {job.eligibility.degrees.join(', ')}</p>
              )}
              {job.eligibility.cgpa !== undefined && (
                <p><strong>Minimum CGPA Required:</strong> {job.eligibility.cgpa}</p>
              )}
              {job.eligibility.batch && job.eligibility.batch.length > 0 && (
                <p><strong>Eligible Batches:</strong> {job.eligibility.batch.join(', ')}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="application-form-wrapper">
          <h3>Application Form</h3>
          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-section">
              <h4>Personal Information</h4>
              
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={user?.name}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={user?.email}
                  placeholder="Your email address"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h4>Academic Information</h4>
              
              <div className="form-group">
                <label htmlFor="degree">Degree</label>
                <input
                  type="text"
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  required
                  placeholder="Your degree (e.g., B.Tech, MCA)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cgpa">CGPA</label>
                <input
                  type="number"
                  id="cgpa"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="Your CGPA (out of 10)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="batch">Batch/Graduation Year</label>
                <input
                  type="text"
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  required
                  placeholder="Your graduation year (e.g., 2023)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  placeholder="Your skills (e.g., JavaScript, Python, React)"
                />
                <small>List your relevant skills separated by commas</small>
              </div>
            </div>
            
            <div className="form-section">
              <h4>Application Details</h4>
              
              <div className="form-group">
                <label htmlFor="experience">Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  placeholder="Describe your relevant experience..."
                ></textarea>
                <small>Describe your relevant experience, skills, and qualifications for this position.</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter</label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  required
                  placeholder="Write a cover letter explaining why you're a good fit..."
                ></textarea>
                <small>Explain why you're interested in this position and why you would be a good fit.</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="resumeLink">Resume Link</label>
                <input
                  type="url"
                  id="resumeLink"
                  name="resumeLink"
                  value={formData.resumeLink}
                  onChange={handleChange}
                  required
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                />
                <small>Provide a link to your resume (Google Drive, Dropbox, etc.)</small>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate(`/jobs/${id}`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JobApplicationForm; 