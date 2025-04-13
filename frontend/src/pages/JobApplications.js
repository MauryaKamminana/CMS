import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import '../styles/jobApplications.css';

function JobApplications() {
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  const { id } = useParams();
  
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      
      // First get the job details
      const jobResponse = await axios.get(`/api/jobs/${id}`);
      
      if (!jobResponse.data.success) {
        toast.error('Failed to load job details');
        return;
      }
      
      setJob(jobResponse.data.data);
      
      // Then get the applications
      const applicationsResponse = await axios.get(`/api/jobs/${id}/applications`);
      
      if (applicationsResponse.data.success) {
        setApplications(applicationsResponse.data.data);
      } else {
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error loading applications');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);
  
  const updateApplicationStatus = async (applicationId, newStatus, notes = '') => {
    try {
      setUpdatingStatus(applicationId);
      
      const response = await axios.put(`/api/jobs/${id}/applications/${applicationId}`, {
        status: newStatus,
        notes: notes
      });
      
      if (response.data.success) {
        // Update the application in the state
        setApplications(prevApplications => 
          prevApplications.map(app => 
            app._id === applicationId ? { ...app, status: newStatus, notes: notes || app.notes } : app
          )
        );
        
        toast.success(`Application status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error(error.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  const handleStatusChange = (applicationId, newStatus) => {
    updateApplicationStatus(applicationId, newStatus);
  };
  
  const exportToCSV = async () => {
    try {
      setExportingCSV(true);
      
      const response = await axios.get(`/api/jobs/${id}/applications/export`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${job.title}-applications.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Applications exported successfully');
    } catch (error) {
      console.error('Error exporting applications:', error);
      toast.error('Error exporting applications');
    } finally {
      setExportingCSV(false);
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
  };
  
  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }
  
  if (!job) {
    return <div className="error-message">Job not found</div>;
  }
  
  return (
    <div className="job-applications-container">
      <div className="job-applications-header">
        <Link to={`/jobs/${id}`} className="btn-back">
          &larr; Back to Job
        </Link>
        
        <h1>Applications for {job.title}</h1>
        
        <div className="job-meta">
          <p><strong>Company:</strong> {job.company}</p>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Status:</strong> <span className={`status-${job.status.toLowerCase()}`}>{job.status}</span></p>
          <p><strong>Posted:</strong> {formatDate(job.createdAt)}</p>
          <p><strong>Deadline:</strong> {formatDate(job.applicationDeadline)}</p>
        </div>
        
        <button 
          className="btn-export" 
          onClick={exportToCSV}
          disabled={exportingCSV || applications.length === 0}
        >
          {exportingCSV ? 'Exporting...' : 'Export to CSV'}
        </button>
      </div>
      
      {applications.length === 0 ? (
        <div className="no-applications">
          No applications received yet.
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Applied On</th>
                <th>CGPA</th>
                <th>Degree</th>
                <th>Batch</th>
                <th>Skills</th>
                <th>Resume</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <tr key={application._id}>
                  <td>{application.student.name}</td>
                  <td>{application.student.email}</td>
                  <td>{formatDate(application.appliedAt)}</td>
                  <td>{application.student.profile?.cgpa || 'N/A'}</td>
                  <td>{application.student.profile?.degree || 'N/A'}</td>
                  <td>{application.student.profile?.batch || 'N/A'}</td>
                  <td>{application.student.profile?.skills || 'N/A'}</td>
                  <td>
                    {application.student.profile?.resumeLink ? (
                      <a 
                        href={application.student.profile.resumeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View Resume
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn-view-details"
                      onClick={() => handleViewDetails(application)}
                    >
                      View Details
                    </button>
                  </td>
                  <td>
                    <div className="status-actions">
                      <select 
                        className="status-select"
                        value={application.status}
                        onChange={(e) => handleStatusChange(application._id, e.target.value)}
                        disabled={updatingStatus === application._id}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Hired">Hired</option>
                      </select>
                      
                      {updatingStatus === application._id && (
                        <span className="updating-indicator">Updating...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedApplication && (
        <div className="application-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="btn-close" onClick={() => setSelectedApplication(null)}>×</button>
            </div>
            <div className="modal-body">
              <h3>{selectedApplication.student.name}</h3>
              <p><strong>Email:</strong> {selectedApplication.student.email}</p>
              <p><strong>Applied On:</strong> {formatDate(selectedApplication.appliedAt)}</p>
              
              <div className="details-section">
                <h4>Academic Information</h4>
                <p><strong>CGPA:</strong> {selectedApplication.student.profile?.cgpa || 'N/A'}</p>
                <p><strong>Degree:</strong> {selectedApplication.student.profile?.degree || 'N/A'}</p>
                <p><strong>Batch:</strong> {selectedApplication.student.profile?.batch || 'N/A'}</p>
              </div>
              
              <div className="details-section">
                <h4>Professional Information</h4>
                <p><strong>Skills:</strong> {selectedApplication.student.profile?.skills || 'N/A'}</p>
                
                {selectedApplication.experience && (
                  <>
                    <h4>Relevant Experience</h4>
                    <div className="experience-text">
                      {selectedApplication.experience}
                    </div>
                  </>
                )}
                
                {selectedApplication.coverLetter && (
                  <>
                    <h4>Cover Letter</h4>
                    <div className="cover-letter-text">
                      {selectedApplication.coverLetter}
                    </div>
                  </>
                )}
              </div>
              
              {selectedApplication.student.profile?.resumeLink && (
                <div className="resume-link">
                  <a 
                    href={selectedApplication.student.profile.resumeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-resume"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobApplications; 