import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/resourceDetail.css';

function ResourceDetail() {
  const [resource, setResource] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { resourceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchResourceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching resource details for ID:', resourceId);
        
        // Fetch resource details
        const resourceResponse = await axios.get(`/api/resources/${resourceId}`);
        
        console.log('Resource API response:', resourceResponse.data);
        
        if (!resourceResponse.data.success) {
          throw new Error(resourceResponse.data.message || 'Failed to load resource');
        }
        
        const resourceData = resourceResponse.data.data;
        console.log('Resource data:', resourceData);
        setResource(resourceData);
        
        // Fetch course details if resource has a course
        if (resourceData.course) {
          console.log('Fetching course details for course ID:', 
            typeof resourceData.course === 'object' ? resourceData.course._id : resourceData.course);
            
          const courseId = typeof resourceData.course === 'object' ? resourceData.course._id : resourceData.course;
          
          const courseResponse = await axios.get(`/api/courses/${courseId}`);
          
          if (courseResponse.data.success) {
            console.log('Course details:', courseResponse.data.data);
            setCourse(courseResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching resource details:', error);
        setError('Error loading resource: ' + (error.response?.data?.message || error.message));
        toast.error('Error loading resource details');
      } finally {
        setLoading(false);
      }
    };
    
    if (resourceId) {
      fetchResourceDetails();
    } else {
      setError('No resource ID provided');
      setLoading(false);
    }
  }, [resourceId]);
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/resources/${resourceId}`);
      
      if (response.data.success) {
        toast.success('Resource deleted successfully');
        navigate('/resources');
      } else {
        toast.error(response.data.message || 'Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Error deleting resource: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return <div className="loading">Loading resource details...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Link to="/resources" className="btn btn-primary">
          Back to Resources
        </Link>
      </div>
    );
  }
  
  if (!resource) {
    return (
      <div className="error-container">
        <p className="error-message">Resource not found</p>
        <Link to="/resources" className="btn btn-primary">
          Back to Resources
        </Link>
      </div>
    );
  }
  
  // Check if user is authorized to edit/delete (creator or admin)
  const isAuthorized = user && (
    user.role === 'admin' || 
    (resource.createdBy && resource.createdBy._id === user.id) ||
    (resource.createdBy && resource.createdBy === user.id)
  );
  
  // Safely get the resource type with a fallback
  const resourceType = resource.type || resource.resourceType || 'document';
  
  // Safely get the first letter of the type and capitalize it
  const typeDisplay = resourceType && typeof resourceType === 'string' 
    ? resourceType.charAt(0).toUpperCase() + resourceType.slice(1) 
    : 'Document';
  
  // Safely get the file URL or link
  const fileUrl = resource.fileUrl || '';
  const linkUrl = resource.link || resource.externalLink || '';
  
  return (
    <div className="resource-detail-container">
      <div className="resource-detail-header">
        <h1>{resource.title}</h1>
        <div className="resource-actions">
          <Link to="/resources" className="btn btn-secondary">
            Back to Resources
          </Link>
          {isAuthorized && (
            <>
              <Link to={`/resources/${resourceId}/edit`} className="btn btn-primary">
                Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="resource-detail-content">
        <div className="resource-info">
          <p className="resource-description">{resource.description}</p>
          
          <div className="resource-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Type:</span>
              <span className="metadata-value">{typeDisplay}</span>
            </div>
            
            {course && (
              <div className="metadata-item">
                <span className="metadata-label">Course:</span>
                <span className="metadata-value">
                  <Link to={`/courses/${course._id}`}>{course.name}</Link>
                </span>
              </div>
            )}
            
            {resource.createdAt && (
              <div className="metadata-item">
                <span className="metadata-label">Added:</span>
                <span className="metadata-value">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {resource.createdBy && (
              <div className="metadata-item">
                <span className="metadata-label">By:</span>
                <span className="metadata-value">
                  {typeof resource.createdBy === 'object' 
                    ? resource.createdBy.name 
                    : 'Faculty'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="resource-access">
          {(resourceType === 'document' || resourceType === 'Document') && fileUrl && (
            <button 
              className="btn btn-success btn-lg"
              onClick={() => handleDownload(fileUrl, resource.title)}
            >
              Download Document
            </button>
          )}
          
          {(resourceType === 'video' || resourceType === 'Video') && fileUrl && (
            <div className="video-container">
              <video controls>
                <source src={fileUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          {(resourceType === 'link' || resourceType === 'Link') && linkUrl && (
            <a 
              href={linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
            >
              Open Link
            </a>
          )}
          
          {/* Fallback if no specific content type is matched */}
          {!fileUrl && !linkUrl && (
            <div className="resource-no-content">
              <p>No downloadable content available for this resource.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceDetail; 