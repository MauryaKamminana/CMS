import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/jobDetail.css';
import ApplicationStatusBar from '../components/ApplicationStatusBar';

function JobDetail() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [applicationDate, setApplicationDate] = useState(null);
  const [applicationNotes, setApplicationNotes] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/jobs/${id}`);
      
      if (response.data.success) {
        setJob(response.data.data);
        
        // Check if user has already applied
        if (user && user.role === 'student') {
          try {
            const applicationsRes = await axios.get('/api/jobs/applications');
            if (applicationsRes.data.success) {
              const application = applicationsRes.data.data.find(
                app => app.job._id === id || app.job === id
              );
              
              if (application) {
                setHasApplied(true);
                setApplicationStatus(application.status);
                setApplicationDate(new Date(application.appliedAt));
                if (application.notes) {
                  setApplicationNotes(application.notes);
                }
              }
            }
          } catch (error) {
            console.error('Error checking application status:', error);
          }
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
  }, [id, user, navigate]);
  
  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);
  
  const handleApplyClick = () => {
    if (!user) {
      toast.error('Please login to apply for this job');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'student') {
      toast.error('Only students can apply for jobs');
      return;
    }
    
    // Navigate to the application form page
    navigate(`/jobs/${id}/apply`);
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f0ad4e'; // Orange
      case 'Shortlisted':
        return '#5bc0de'; // Blue
      case 'Selected':
        return '#5cb85c'; // Green
      case 'Rejected':
        return '#d9534f'; // Red
      case 'On Hold':
        return '#777777'; // Gray
      default:
        return '#f0ad4e'; // Default orange
    }
  };
  
  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }
  
  if (!job) {
    return <div className="error-message">Job not found</div>;
  }
  
  const isJobActive = job.status === 'Open' && new Date(job.applicationDeadline) > new Date();
  
  // Safely handle requirements that might be undefined
  const requirementsList = job.requirements ? job.requirements.split('\n').filter(req => req.trim() !== '') : [];
  
  // Safely handle application process that might be undefined
  const applicationProcess = job.applicationProcess ? job.applicationProcess.split('\n').filter(step => step.trim() !== '') : [];
  
  // Safely handle description that might be undefined
  const descriptionParagraphs = job.description ? job.description.split('\n').filter(para => para.trim() !== '') : [];
  
  const renderEligibilityCriteria = () => {
    if (!job.eligibility) return null;
    
    return (
      <section className="job-section">
        <h3>Eligibility Criteria</h3>
        <div className="eligibility-criteria">
          {job.eligibility.degrees && job.eligibility.degrees.length > 0 && (
            <div className="eligibility-item">
              <strong>Eligible Degrees:</strong> {job.eligibility.degrees.join(', ')}
            </div>
          )}
          
          {job.eligibility.cgpa !== undefined && (
            <div className="eligibility-item">
              <strong>Minimum CGPA Required:</strong> {job.eligibility.cgpa}
            </div>
          )}
          
          {job.eligibility.batch && job.eligibility.batch.length > 0 && (
            <div className="eligibility-item">
              <strong>Eligible Batches:</strong> {job.eligibility.batch.join(', ')}
            </div>
          )}
          
          {job.eligibility.additionalCriteria && (
            <div className="eligibility-item">
              <strong>Additional Criteria:</strong> {job.eligibility.additionalCriteria}
            </div>
          )}
        </div>
      </section>
    );
  };
  
  return (
    <div className="job-detail-container">
      <div className="job-detail-header">
        <div className="job-title-section">
          <h1>{job.title}</h1>
          <span className={`job-type ${job.jobType.toLowerCase().replace(/\s+/g, '')}`}>
            {job.jobType}
          </span>
          <span className={`job-status status-${job.status.toLowerCase()}`}>
            {job.status}
          </span>
        </div>
        
        <div className="job-company-section">
          <h2>{job.company}</h2>
          <div className="job-location">{job.location}</div>
        </div>
        
        <div className="job-meta">
          <div className="job-meta-item">
            <strong>Salary:</strong> {job.salary || 'Not specified'}
          </div>
          <div className="job-meta-item">
            <strong>Posted:</strong> {formatDate(job.createdAt)}
          </div>
          <div className="job-meta-item">
            <strong>Application Deadline:</strong> {formatDate(job.applicationDeadline)}
          </div>
        </div>
      </div>
      
      <div className="job-detail-content">
        <div className="job-main-content">
          <section className="job-section">
            <h3>Job Description</h3>
            <div className="job-description">
              {descriptionParagraphs.length > 0 ? (
                descriptionParagraphs.map((para, index) => (
                  <p key={index}>{para}</p>
                ))
              ) : (
                <p>No description provided.</p>
              )}
            </div>
          </section>
          
          <section className="job-section">
            <h3>Requirements</h3>
            <div className="job-requirements">
              {requirementsList.length > 0 ? (
                <ul>
                  {requirementsList.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific requirements listed.</p>
              )}
            </div>
          </section>
          
          {applicationProcess.length > 0 && (
            <section className="job-section">
              <h3>Application Process</h3>
              <div className="application-process">
                <ol>
                  {applicationProcess.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </section>
          )}
          
          {job.applicationLink && (
            <section className="job-section">
              <h3>External Application Link</h3>
              <div className="application-link-container">
                <p>Apply directly through the company website:</p>
                <a 
                  href={job.applicationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="application-link"
                >
                  {job.applicationLink}
                </a>
              </div>
            </section>
          )}
          
          {job.attachments && job.attachments.length > 0 && (
            <section className="job-section">
              <h3>Attachments</h3>
              <div className="attachments-list">
                {job.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      {attachment.name}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {renderEligibilityCriteria()}
        </div>
        
        <div className="job-sidebar">
          <div className="application-card">
            <h3>Application</h3>
            
            {hasApplied ? (
              <div className="already-applied">
                <button className="btn-applied" disabled>
                  Applied
                </button>
                
                <div className="application-status-container">
                  <p className="application-date">
                    Applied on: {applicationDate ? formatDate(applicationDate) : 'N/A'}
                  </p>
                  
                  <div className="application-status-wrapper">
                    <p className="status-label">Status:</p>
                    <div className="status-indicator">
                      <div 
                        className="status-bar"
                        style={{
                          backgroundColor: getStatusColor(applicationStatus)
                        }}
                      ></div>
                      <p className="status-text" style={{ color: getStatusColor(applicationStatus) }}>
                        {applicationStatus || 'Pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="status-description">
                    {applicationStatus === 'Pending' && (
                      <p>Your application is being reviewed.</p>
                    )}
                    {applicationStatus === 'Shortlisted' && (
                      <p>Congratulations! You've been shortlisted for the next round.</p>
                    )}
                    {applicationStatus === 'Selected' && (
                      <p>Congratulations! You've been selected for this position.</p>
                    )}
                    {applicationStatus === 'Rejected' && (
                      <p>We're sorry, your application was not selected for this position.</p>
                    )}
                    {applicationStatus === 'On Hold' && (
                      <p>Your application is currently on hold.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : isJobActive ? (
              user?.role === 'student' ? (
                <button 
                  className="btn-apply" 
                  onClick={handleApplyClick}
                >
                  Apply Now
                </button>
              ) : (
                <div className="login-prompt">
                  <p>Only students can apply for jobs.</p>
                </div>
              )
            ) : (
              <div className="deadline-passed">
                <p>Application deadline has passed</p>
              </div>
            )}
            
            {!user && (
              <div className="login-prompt">
                <p>Please <a href="/login">login</a> to apply for this job.</p>
              </div>
            )}
          </div>
          
          <div className="eligibility-card">
            <h3>Eligibility Criteria</h3>
            <div className="eligibility-details">
              {job.eligibility?.degrees && job.eligibility.degrees.length > 0 && (
                <div className="eligibility-item">
                  <strong>Degrees:</strong>
                  <ul>
                    {job.eligibility.degrees.map((degree, index) => (
                      <li key={index}>{degree}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {job.eligibility?.cgpa !== undefined && (
                <div className="eligibility-item">
                  <strong>Minimum CGPA:</strong> {job.eligibility.cgpa}
                </div>
              )}
              
              {job.eligibility?.batch && job.eligibility.batch.length > 0 && (
                <div className="eligibility-item">
                  <strong>Eligible Batches:</strong>
                  <ul>
                    {job.eligibility.batch.map((batch, index) => (
                      <li key={index}>{batch}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {job.eligibility?.additionalCriteria && (
                <div className="eligibility-item">
                  <strong>Additional Criteria:</strong>
                  <p>{job.eligibility.additionalCriteria}</p>
                </div>
              )}
              
              {(!job.eligibility || 
                (!job.eligibility.degrees?.length && 
                 job.eligibility.cgpa === undefined && 
                 !job.eligibility.batch?.length && 
                 !job.eligibility.additionalCriteria)) && (
                <p>No specific eligibility criteria specified.</p>
              )}
            </div>
          </div>
          
          <div className="contact-card">
            <h3>Contact Information</h3>
            {job.contactEmail && (
              <p>
                <strong>Email:</strong> <a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a>
              </p>
            )}
            {job.contactPhone && (
              <p>
                <strong>Phone:</strong> <a href={`tel:${job.contactPhone}`}>{job.contactPhone}</a>
              </p>
            )}
            {(!job.contactEmail && !job.contactPhone) && (
              <p>No contact information provided.</p>
            )}
          </div>
          
          {(user?.role === 'placement' || user?.role === 'admin') && (
            <div className="admin-actions">
              <h3>Admin Actions</h3>
              <a href={`/jobs/${id}/edit`} className="btn-edit">
                Edit Job
              </a>
              <a href={`/jobs/${id}/applications`} className="btn-view-apps">
                View Applications ({job.applicationsCount || 0})
              </a>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this job?')) {
                    axios.delete(`/api/jobs/${id}`)
                      .then(res => {
                        if (res.data.success) {
                          toast.success('Job deleted successfully');
                          navigate('/jobs');
                        }
                      })
                      .catch(err => {
                        console.error('Error deleting job:', err);
                        toast.error('Failed to delete job');
                      });
                  }
                }}
                className="btn btn-danger"
                style={{ marginTop: '10px' }}
              >
                Delete Job
              </button>
            </div>
          )}
        </div>
      </div>
      
      {user && user.role === 'student' && hasApplied && (
        <ApplicationStatusBar 
          status={applicationStatus} 
          notes={applicationNotes}
        />
      )}
    </div>
  );
}

export default JobDetail; 