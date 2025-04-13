import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState({});
  const [filter, setFilter] = useState({
    course: '',
    resourceType: ''
  });
  const { user } = useAuth();

  // Fetch all courses for the filter dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/courses');
        if (res.data.success) {
          const courseData = {};
          res.data.data.forEach(course => {
            courseData[course._id] = course;
          });
          setCourses(courseData);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch resources based on filters
  useEffect(() => {
    const fetchResources = async () => {
      try {
        let url = '/api/resources';
        const params = new URLSearchParams();
        
        if (filter.course) {
          params.append('course', filter.course);
        }
        
        if (filter.resourceType) {
          params.append('resourceType', filter.resourceType);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        console.log('Fetching resources with URL:', url);
        
        const res = await axios.get(url);
        if (res.data.success) {
          console.log(`Found ${res.data.count} resources`);
          setResources(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast.error('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCourseName = (courseId) => {
    if (courses[courseId]) {
      return `${courses[courseId].name} (${courses[courseId].code})`;
    }
    return 'Loading...';
  };

  if (loading) {
    return <div className="loading">Loading resources...</div>;
  }

  return (
    <div className="resources-page">
      <div className="page-header">
        <h1>Resources</h1>
        {(user.role === 'faculty' || user.role === 'admin') && (
          <Link to="/resources/new" className="btn btn-primary">
            Upload New Resource
          </Link>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="course">Filter by Course:</label>
          <select
            id="course"
            name="course"
            value={filter.course}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Courses</option>
            {Object.values(courses).map(course => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="resourceType">Filter by Type:</label>
          <select
            id="resourceType"
            name="resourceType"
            value={filter.resourceType}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Types</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="link">Links</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="no-resources">
          <p>No resources available.</p>
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
                  <span className="resource-course">
                    Course: {getCourseName(resource.course)}
                  </span>
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

export default Resources; 