import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function CourseResources() {
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const { user } = useAuth();
  
  const isFaculty = user && (user.role === 'faculty' || user.role === 'admin');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${id}`);
      if (courseRes.data.success) {
        // Make sure course is properly structured
        const courseData = courseRes.data.data;
        setCourse({
          id: courseData._id,
          name: courseData.name || 'Untitled Course',
          code: courseData.code || 'No Code',
          description: courseData.description || ''
        });
      } else {
        toast.error('Failed to load course details');
      }
      
      // Fetch resources for this course
      const resourcesRes = await axios.get(`/api/courses/${id}/resources`);
      if (resourcesRes.data.success) {
        // Process resources to ensure proper data structure
        const processedResources = resourcesRes.data.data.map(resource => {
          const result = { ...resource };
          
          // Make sure createdBy is handled properly
          if (result.createdBy && typeof result.createdBy === 'object') {
            result.creatorName = result.createdBy.name;
          }
          
          return result;
        });
        
        setResources(processedResources);
      } else {
        toast.error('Failed to load resources');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load course resources');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'video':
        return '🎬';
      case 'link':
        return '🔗';
      default:
        return '📦';
    }
  };

  if (loading) {
    return <div className="loading">Loading resources...</div>;
  }

  if (!course) {
    return <div className="not-found">Course not found</div>;
  }

  return (
    <div className="course-resources">
      <h1>Resources for {course.name} ({course.code})</h1>
      
      {isFaculty && (
        <div className="actions">
          <Link to={`/resources/new?course=${id}`} className="btn btn-primary">
            Add Resource
          </Link>
        </div>
      )}
      
      {resources.length === 0 ? (
        <div className="no-data">
          <p>No resources found for this course.</p>
        </div>
      ) : (
        <div className="resources-list">
          {resources.map(resource => (
            <div key={resource._id} className="resource-item">
              <div className="resource-icon">
                {getResourceTypeIcon(resource.resourceType)}
              </div>
              <div className="resource-info">
                <h3>
                  <Link to={`/resources/${resource._id}`}>{resource.title}</Link>
                </h3>
                <p>{resource.description}</p>
                <p className="resource-meta">
                  <span>Added: {formatDate(resource.createdAt)}</span>
                  {resource.creatorName && (
                    <span>By: {resource.creatorName}</span>
                  )}
                </p>
              </div>
              <div className="resource-actions">
                <Link to={`/resources/${resource._id}`} className="btn btn-sm btn-primary">
                  View Details
                </Link>
                {resource.resourceType === 'document' && resource.fileUrl && (
                  <a 
                    href={resource.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    Download
                  </a>
                )}
                {resource.resourceType === 'link' && resource.externalLink && (
                  <a 
                    href={resource.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    Visit Link
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseResources; 