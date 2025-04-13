import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import '../styles/resources.css';

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { courseId } = useParams();
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching resources for course: ${courseId}`);
        const response = await axios.get(`/api/courses/${courseId}/resources`);
        
        if (response.data.success) {
          setResources(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load resources');
          toast.error(response.data.message || 'Failed to load resources');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading resources: ' + (error.response?.data?.message || error.message));
        toast.error('Error loading resources');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchResources();
    }
  }, [courseId]);
  
  const handleDownload = (resourceUrl, resourceName) => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = resourceUrl;
    link.download = resourceName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return <div className="loading">Loading resources...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="resources-container">
      <div className="resources-header">
        <h2>Course Resources</h2>
        <Link to={`/courses/${courseId}/add-resource`} className="btn btn-primary">
          Add Resource
        </Link>
      </div>
      
      {resources.length === 0 ? (
        <div className="no-resources">
          <p>No resources available for this course yet.</p>
        </div>
      ) : (
        <div className="resources-list">
          {resources.map(resource => (
            <div key={resource._id} className="resource-card">
              <div className="resource-info">
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="resource-meta">
                  <span>Type: {resource.type}</span>
                  <span>Added: {new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="resource-actions">
                {resource.fileUrl ? (
                  <button 
                    className="btn btn-success"
                    onClick={() => handleDownload(resource.fileUrl, resource.title)}
                  >
                    Download
                  </button>
                ) : resource.link ? (
                  <a 
                    href={resource.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Open Link
                  </a>
                ) : null}
                <Link to={`/resources/${resource._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Resources; 