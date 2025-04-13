import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

function CourseResources() {
  const [resources, setResources] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseRes = await axios.get(`/api/courses/${id}`);
        if (courseRes.data.success) {
          setCourse(courseRes.data.data);
        }
        
        // Fetch resources for this course
        const resourcesRes = await axios.get(`/api/resources?course=${id}`);
        if (resourcesRes.data.success) {
          setResources(resourcesRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isFaculty = course && course.faculty && course.faculty.includes(user?.id);
  const isAdmin = user && user.role === 'admin';
  const canAddResource = isFaculty || isAdmin;

  if (loading) {
    return <div className="loading">Loading resources...</div>;
  }

  return (
    <div className="course-resources-page">
      <div className="page-header">
        <div>
          <h1>Resources for {course ? `${course.name} (${course.code})` : 'Course'}</h1>
          <Link to={`/courses/${id}`} className="btn btn-secondary">
            Back to Course
          </Link>
        </div>
        {canAddResource && (
          <Link 
            to="/resources/new" 
            className="btn btn-primary"
            state={{ preselectedCourse: id }}
          >
            Add Resource
          </Link>
        )}
      </div>

      {resources.length === 0 ? (
        <div className="no-resources">
          <p>No resources available for this course.</p>
        </div>
      ) : (
        <div className="resources-grid">
          {resources.map(resource => (
            <div key={resource._id} className="resource-card">
              <div className="resource-icon">
                {getResourceTypeIcon(resource.resourceType)}
              </div>
              <div className="resource-content">
                <h3>
                  <Link to={`/resources/${resource._id}`}>{resource.title}</Link>
                </h3>
                <p className="resource-description">{resource.description}</p>
                <div className="resource-meta">
                  <span className="resource-date">
                    Added: {formatDate(resource.createdAt)}
                  </span>
                </div>
              </div>
              <div className="resource-actions">
                {resource.resourceType === 'document' && resource.fileUrl && (
                  <a 
                    href={resource.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    View Document
                  </a>
                )}
                {resource.resourceType === 'video' && resource.fileUrl && (
                  <a 
                    href={resource.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    Watch Video
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