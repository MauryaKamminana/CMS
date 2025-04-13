import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import '../../styles/placementDashboard.css';

function PlacementDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch job statistics
      const statsRes = await axios.get('/api/jobs/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      
      // Fetch recent jobs
      const jobsRes = await axios.get('/api/jobs?limit=3&sort=-createdAt');
      if (jobsRes.data.success) {
        setRecentJobs(jobsRes.data.data);
      }
      
      // Fetch upcoming deadlines
      const today = new Date().toISOString();
      const deadlinesRes = await axios.get(`/api/jobs?applicationDeadline[gte]=${today}&sort=applicationDeadline&limit=3`);
      if (deadlinesRes.data.success) {
        setUpcomingDeadlines(deadlinesRes.data.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="placement-dashboard-container">
      <h1>Placement Officer Dashboard</h1>
      
      <div className="dashboard-actions">
        <Link to="/jobs/create" className="btn btn-primary">
          <i className="fas fa-plus-circle"></i> Post New Job
        </Link>
        <Link to="/jobs" className="btn btn-secondary">
          <i className="fas fa-briefcase"></i> Manage Jobs
        </Link>
      </div>
      
      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          <div className="stats-section">
            <h2>Overview</h2>
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-value">{stats.totalJobs}</div>
                <div className="stat-label">Total Jobs</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.activeJobs}</div>
                <div className="stat-label">Active Jobs</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalApplications}</div>
                <div className="stat-label">Total Applications</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.pendingApplications}</div>
                <div className="stat-label">Pending Applications</div>
              </div>
            </div>
          </div>
          
          <div className="recent-jobs-section">
            <div className="section-header">
              <h2>Recent Jobs</h2>
              <Link to="/jobs" className="view-all-link">View All</Link>
            </div>
            
            {recentJobs.length === 0 ? (
              <div className="no-data">No jobs posted yet</div>
            ) : (
              <div className="jobs-list">
                {recentJobs.map(job => (
                  <div key={job._id} className="job-card">
                    <div className="job-header">
                      <h3 className="job-title">{job.title}</h3>
                      <span className={`job-status status-${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="job-company">{job.company}</div>
                    <div className="job-meta">
                      <span className="job-location">
                        <i className="fas fa-map-marker-alt"></i> {job.location}
                      </span>
                      <span className="job-type">
                        <i className="fas fa-briefcase"></i> {job.jobType}
                      </span>
                    </div>
                    <div className="job-deadline">
                      <strong>Deadline:</strong> {formatDate(job.applicationDeadline)}
                    </div>
                    <div className="job-actions">
                      <Link to={`/jobs/${job._id}`} className="btn btn-sm">
                        View Details
                      </Link>
                      <Link to={`/jobs/${job._id}/applications`} className="btn btn-sm">
                        Applications
                      </Link>
                      <Link to={`/jobs/${job._id}/edit`} className="btn btn-sm">
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="upcoming-deadlines-section">
            <div className="section-header">
              <h2>Upcoming Deadlines</h2>
            </div>
            
            {upcomingDeadlines.length === 0 ? (
              <div className="no-data">No upcoming deadlines</div>
            ) : (
              <div className="deadlines-list">
                {upcomingDeadlines.map(job => (
                  <div key={job._id} className="deadline-card">
                    <div className="deadline-info">
                      <h3>{job.title} - {job.company}</h3>
                      <div className="deadline-date">
                        <i className="fas fa-calendar-alt"></i> Closes on {formatDate(job.applicationDeadline)}
                      </div>
                    </div>
                    <div className="deadline-actions">
                      <Link to={`/jobs/${job._id}/applications`} className="btn btn-sm">
                        View Applications
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="quick-actions-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Link to="/jobs/create" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="quick-action-text">Post New Job</div>
              </Link>
              <Link to="/jobs" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <div className="quick-action-text">Manage Jobs</div>
              </Link>
              <Link to="/profile" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-user-cog"></i>
                </div>
                <div className="quick-action-text">Profile Settings</div>
              </Link>
              <Link to="/canteen/dashboard" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-utensils"></i>
                </div>
                <div className="quick-action-text">Canteen Services</div>
              </Link>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Canteen Services</h3>
            </div>
            <div className="card-body">
              <p>Order food from the campus canteen</p>
              <div className="action-buttons">
                <Link to="/canteen/dashboard" className="btn btn-primary">
                  Go to Canteen
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PlacementDashboard; 