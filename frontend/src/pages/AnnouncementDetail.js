import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AnnouncementDetail() {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchAnnouncement = useCallback(async () => {
    try {
      const res = await axios.get(`/api/announcements/${id}`);
      setAnnouncement(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching announcement');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  const deleteAnnouncement = async () => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`/api/announcements/${id}`);
        toast.success('Announcement deleted successfully');
        navigate('/announcements');
      } catch (error) {
        toast.error('Error deleting announcement');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <p>Loading announcement...</p>;
  }

  if (!announcement) {
    return <p>Announcement not found</p>;
  }

  return (
    <div className="announcement-detail">
      <div className="announcement-detail-header">
        <h1>{announcement.title}</h1>
        <span className={`category-badge category-${announcement.category.toLowerCase()}`}>
          {announcement.category}
        </span>
        {announcement.important && (
          <span className="important-badge">Important</span>
        )}
      </div>
      
      <div className="announcement-meta">
        <p>Posted by: {announcement.createdBy?.name || 'Admin'}</p>
        <p>Date: {formatDate(announcement.createdAt)}</p>
      </div>
      
      <div className="announcement-detail-content">
        <p>{announcement.content}</p>
      </div>
      
      <div className="announcement-actions">
        <Link to="/announcements" className="btn btn-secondary">
          Back to Announcements
        </Link>
        
        {user && user.role === 'admin' && (
          <>
            <Link to={`/announcements/edit/${id}`} className="btn btn-primary">
              Edit
            </Link>
            <button onClick={deleteAnnouncement} className="btn btn-danger">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AnnouncementDetail; 