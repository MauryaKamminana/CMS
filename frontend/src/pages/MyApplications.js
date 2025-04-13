import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import '../styles/myApplications.css';
import ApplicationStatusBar from '../components/ApplicationStatusBar';

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMyApplications();
  }, []);
  
  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/jobs/applications');
      
      if (response.data.success) {
        setApplications(response.data.data);
      } else {
        toast.error('Failed to load your applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error loading your applications');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return <div className="loading">Loading your applications...</div>;
  }
  
  return (
    <div className="my-applications-container">
      <h1>My Job Applications</h1>
      
      {applications.length === 0 ? (
        <div className="no-applications">
          <p>You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="btn-browse">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div key={application._id} className="application-card">
              <div className="application-header">
                <h3>{application.job.title}</h3>
                <span className="company-name">{application.job.company}</span>
              </div>
              
              <ApplicationStatusBar 
                status={application.status} 
                notes={application.notes}
              />
              
              <div className="application-meta">
                <p><strong>Applied On:</strong> {formatDate(application.appliedAt)}</p>
                <p><strong>Job Type:</strong> {application.job.jobType}</p>
                <p><strong>Location:</strong> {application.job.location}</p>
                <p><strong>Application Deadline:</strong> {formatDate(application.job.applicationDeadline)}</p>
              </div>
              
              <div className="application-actions">
                <Link to={`/jobs/${application.job.id}`} className="btn-view">
                  View Job Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplications; 