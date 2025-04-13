/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  
  const { user } = useAuth();

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `/api/announcements?page=${currentPage}&limit=5`;
      if (filter) {
        url += `&category=${filter}`;
      }
      
      const res = await axios.get(url);
      setAnnouncements(res.data.data);
      
      const total = res.data.pagination?.next 
        ? (res.data.pagination.next.page) * 5 
        : res.data.count;
      
      setTotalPages(Math.ceil(total / 5));
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching announcements');
      setLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="announcements-page">
      <div className="announcements-header">
        <h1>Announcements</h1>
        {user && user.role === 'admin' && (
          <Link to="/announcements/new" className="btn btn-primary">
            Create Announcement
          </Link>
        )}
      </div>
      
      <div className="filter-container">
        <label htmlFor="filter">Filter by Category:</label>
        <select 
          id="filter" 
          value={filter} 
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Academic">Academic</option>
          <option value="Event">Event</option>
          <option value="Placement">Placement</option>
          <option value="General">General</option>
          <option value="Emergency">Emergency</option>
        </select>
      </div>
      
      {loading ? (
        <p>Loading announcements...</p>
      ) : (
        <>
          {announcements.length === 0 ? (
            <p>No announcements found.</p>
          ) : (
            <div className="announcements-list">
              {announcements.map(announcement => (
                <div 
                  key={announcement._id} 
                  className={`announcement-card ${announcement.important ? 'important' : ''}`}
                >
                  <div className="announcement-header">
                    <h3>{announcement.title}</h3>
                    <span className={`category-badge category-${announcement.category.toLowerCase()}`}>
                      {announcement.category}
                    </span>
                  </div>
                  <div className="announcement-content">
                    <p>{announcement.content.length > 200 
                      ? `${announcement.content.substring(0, 200)}...` 
                      : announcement.content}
                    </p>
                    <Link to={`/announcements/${announcement._id}`} className="read-more">
                      Read More
                    </Link>
                  </div>
                  <div className="announcement-footer">
                    <span>Posted by: {announcement.createdBy?.name || 'Admin'}</span>
                    <span>Date: {formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Announcements; 