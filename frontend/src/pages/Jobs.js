import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/jobs.css';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    location: '',
    status: 'Open'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [totalJobs, setTotalJobs] = useState(0);
  
  const { user } = useAuth();
  
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `/api/jobs?page=${currentPage}&limit=10&status=${filters.status}`;
      
      if (filters.search) {
        url += `&search=${filters.search}`;
      }
      
      if (filters.jobType) {
        url += `&jobType=${filters.jobType}`;
      }
      
      if (filters.location) {
        url += `&location=${filters.location}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setJobs(response.data.data);
        setTotalPages(Math.ceil(response.data.pagination?.next?.page || 1));
        setTotalJobs(response.data.pagination?.total || 0);
      } else {
        toast.error('Failed to load jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Error loading jobs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);
  
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handlePostJobClick = (e) => {
    console.log("Post Job button clicked");
    // No need to do anything else, just for debugging
  };
  
  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Job Opportunities</h1>
        <div className="jobs-count">
          {!loading && <span>Found {totalJobs} job{totalJobs !== 1 ? 's' : ''}</span>}
        </div>
        {user && (user.role === 'placement' || user.role === 'admin') && (
          <Link 
            to="/jobs/create" 
            className="btn btn-primary"
            onClick={handlePostJobClick}
          >
            Post New Job
          </Link>
        )}
      </div>
      
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <input
              type="text"
              name="search"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={handleFilterChange}
            />
            <button type="submit" className="btn-search">
              Search
            </button>
          </div>
          
          <div className="filter-options">
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
            
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
            />
            
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="Open">Open Positions</option>
              <option value="Closed">Closed Positions</option>
              <option value="">All Positions</option>
            </select>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className="loading">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No job listings found</p>
          {user && (user.role === 'placement' || user.role === 'admin') && (
            <Link to="/jobs/create" className="btn btn-primary">
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <div className="jobs-list">
          {jobs.map(job => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <h2>{job.title}</h2>
                <span className={`job-type ${job.jobType.toLowerCase().replace('-', '')}`}>
                  {job.jobType}
                </span>
              </div>
              
              <div className="job-company">
                <strong>{job.company}</strong> • {job.location}
              </div>
              
              <div className="job-description">
                {job.description.substring(0, 200)}...
              </div>
              
              <div className="job-footer">
                <div className="job-meta">
                  <span>Posted: {formatDate(job.createdAt)}</span>
                  <span>Deadline: {formatDate(job.applicationDeadline)}</span>
                </div>
                
                <Link to={`/jobs/${job._id}`} className="btn btn-view">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-page"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Jobs; 