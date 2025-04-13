import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function LostItemDetail() {
  const [lostItem, setLostItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchLostItem = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/lost-items/${id}`);
      setLostItem(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching item details');
      setLoading(false);
      navigate('/lost-items');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLostItem();
  }, [fetchLostItem]);

  const deleteLostItem = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/lost-items/${id}`);
        toast.success('Item deleted successfully');
        navigate('/lost-items');
      } catch (error) {
        toast.error('Error deleting item');
      }
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await axios.put(`/api/lost-items/${id}`, {
        ...lostItem,
        status: newStatus
      });
      
      setLostItem(res.data.data);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Error updating status');
    }
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

  if (loading) {
    return <p>Loading item details...</p>;
  }

  if (!lostItem) {
    return <p>Item not found</p>;
  }

  const isOwner = user && lostItem.user && user.id === lostItem.user._id;
  const isAdminOrOwner = user && (user.role === 'admin' || isOwner);

  return (
    <div className="lost-item-detail">
      <div className="lost-item-detail-header">
        <h1>{lostItem.title}</h1>
        <span className={`status-badge ${getStatusClass(lostItem.status)}`}>
          {lostItem.status.charAt(0).toUpperCase() + lostItem.status.slice(1)}
        </span>
      </div>
      
      <div className="lost-item-meta">
        <p><strong>Category:</strong> {lostItem.category}</p>
        <p><strong>Location:</strong> {lostItem.location}</p>
        <p><strong>Date:</strong> {formatDate(lostItem.date)}</p>
        <p><strong>Posted by:</strong> {lostItem.user?.name || 'Anonymous'}</p>
        <p><strong>Contact:</strong> {lostItem.contactInfo}</p>
      </div>
      
      <div className="lost-item-detail-content">
        <h3>Description</h3>
        <p>{lostItem.description}</p>
      </div>
      
      {lostItem.image && (
        <div className="lost-item-image">
          <img src={lostItem.image} alt={lostItem.title} />
        </div>
      )}
      
      <div className="lost-item-actions">
        <Link to="/lost-items" className="btn btn-secondary">
          Back to Lost & Found
        </Link>
        
        {isAdminOrOwner && (
          <>
            <Link to={`/lost-items/edit/${id}`} className="btn btn-primary">
              Edit
            </Link>
            <button onClick={deleteLostItem} className="btn btn-danger">
              Delete
            </button>
          </>
        )}
        
        {isOwner && (
          <div className="status-actions">
            <h4>Update Status:</h4>
            <div className="status-buttons">
              {lostItem.status !== 'lost' && (
                <button 
                  onClick={() => updateStatus('lost')}
                  className="btn btn-small status-btn lost-btn"
                >
                  Mark as Lost
                </button>
              )}
              {lostItem.status !== 'found' && (
                <button 
                  onClick={() => updateStatus('found')}
                  className="btn btn-small status-btn found-btn"
                >
                  Mark as Found
                </button>
              )}
              {lostItem.status !== 'claimed' && (
                <button 
                  onClick={() => updateStatus('claimed')}
                  className="btn btn-small status-btn claimed-btn"
                >
                  Mark as Claimed
                </button>
              )}
              {lostItem.status !== 'returned' && (
                <button 
                  onClick={() => updateStatus('returned')}
                  className="btn btn-small status-btn returned-btn"
                >
                  Mark as Returned
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LostItemDetail; 