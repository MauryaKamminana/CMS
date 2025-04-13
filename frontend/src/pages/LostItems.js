import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function LostItems() {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { user } = useAuth();

  const fetchLostItems = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `/api/lost-items?page=${currentPage}&limit=6`;
      if (filter) {
        url += `&category=${filter}`;
      }
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const res = await axios.get(url);
      
      setLostItems(res.data.data);
      
      // Calculate total pages
      const total = res.data.pagination.next 
        ? (res.data.pagination.next.page) * 6 
        : res.data.count;
      
      setTotalPages(Math.ceil(total / 6));
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching lost items');
      setLoading(false);
    }
  }, [currentPage, filter, statusFilter]);

  useEffect(() => {
    fetchLostItems();
  }, [fetchLostItems]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'lost':
        return 'status-lost';
      case 'found':
        return 'status-found';
      case 'claimed':
        return 'status-claimed';
      case 'returned':
        return 'status-returned';
      default:
        return '';
    }
  };

  return (
    <div className="lost-items-page">
      <div className="lost-items-header">
        <h1>Lost & Found</h1>
        {user && (
          <Link to="/lost-items/new" className="btn btn-primary">
            Post New Item
          </Link>
        )}
      </div>
      
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select 
            id="category-filter" 
            value={filter} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Documents">Documents</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter" 
            value={statusFilter} 
            onChange={handleStatusFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <p>Loading items...</p>
      ) : (
        <>
          {lostItems.length === 0 ? (
            <p>No items found.</p>
          ) : (
            <div className="lost-items-grid">
              {lostItems.map(item => (
                <div key={item._id} className="lost-item-card">
                  <div className="lost-item-header">
                    <h3>{item.title}</h3>
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="lost-item-details">
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Location:</strong> {item.location}</p>
                    <p><strong>Date:</strong> {formatDate(item.date)}</p>
                    <p className="lost-item-description">
                      {item.description.length > 100 
                        ? `${item.description.substring(0, 100)}...` 
                        : item.description}
                    </p>
                  </div>
                  
                  <div className="lost-item-footer">
                    <Link to={`/lost-items/${item._id}`} className="btn btn-small">
                      View Details
                    </Link>
                    <span className="posted-by">Posted by: {item.user?.name || 'Anonymous'}</span>
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

export default LostItems; 