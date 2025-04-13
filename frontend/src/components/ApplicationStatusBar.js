import React from 'react';
import '../styles/applicationStatusBar.css';

function ApplicationStatusBar({ status, notes }) {
  // Define status colors
  const statusColors = {
    pending: '#f39c12',
    reviewing: '#3498db',
    shortlisted: '#2ecc71',
    rejected: '#e74c3c',
    accepted: '#27ae60',
    interview: '#9b59b6'
  };
  
  const getStatusColor = (status) => {
    return statusColors[status.toLowerCase()] || '#6c757d';
  };
  
  return (
    <div className="application-status-bar">
      <div className="status-header">
        <h3>Application Status</h3>
      </div>
      
      <div 
        className="status-indicator" 
        style={{ backgroundColor: getStatusColor(status) }}
      >
        <span className="status-text">{status}</span>
      </div>
      
      {notes && (
        <div className="status-notes">
          <h4>Feedback/Notes:</h4>
          <p>{notes}</p>
        </div>
      )}
      
      <div className="status-timeline">
        <div className={`timeline-step ${status === 'Pending' || status === 'Reviewing' || status === 'Shortlisted' || status === 'Interview' || status === 'Accepted' ? 'active' : ''}`}>
          <div className="step-indicator"></div>
          <div className="step-label">Pending</div>
        </div>
        <div className={`timeline-step ${status === 'Reviewing' || status === 'Shortlisted' || status === 'Interview' || status === 'Accepted' ? 'active' : ''}`}>
          <div className="step-indicator"></div>
          <div className="step-label">Reviewing</div>
        </div>
        <div className={`timeline-step ${status === 'Shortlisted' || status === 'Interview' || status === 'Accepted' ? 'active' : ''}`}>
          <div className="step-indicator"></div>
          <div className="step-label">Shortlisted</div>
        </div>
        <div className={`timeline-step ${status === 'Interview' || status === 'Accepted' ? 'active' : ''}`}>
          <div className="step-indicator"></div>
          <div className="step-label">Interview</div>
        </div>
        <div className={`timeline-step ${status === 'Accepted' ? 'active' : ''}`}>
          <div className="step-indicator"></div>
          <div className="step-label">Accepted</div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationStatusBar; 