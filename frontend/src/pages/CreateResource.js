import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';

function CreateResource() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    resourceType: 'document',
    fileUrl: '',
    externalLink: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  
  const navigate = useNavigate();

  const { title, description, course, resourceType, fileUrl, externalLink } = formData;

  // Fetch faculty's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/users/courses');
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
      if (!title || !description || !course || !resourceType) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Validate resource type specific fields
      if ((resourceType === 'document' || resourceType === 'video') && !fileUrl) {
        toast.error('Please provide a file URL');
        setLoading(false);
        return;
      }
      
      if (resourceType === 'link' && !externalLink) {
        toast.error('Please provide an external link');
        setLoading(false);
        return;
      }
      
      // Create resource data object
      const resourceData = {
        title,
        description,
        course,
        resourceType,
        fileUrl: resourceType === 'document' || resourceType === 'video' ? fileUrl : '',
        externalLink: resourceType === 'link' ? externalLink : ''
      };
      
      console.log('Submitting resource data:', resourceData);
      
      const res = await axios.post('/api/resources', resourceData);
      
      if (res.data.success) {
        toast.success('Resource uploaded successfully');
        navigate('/resources');
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server responded with error:', error.response.data);
        toast.error(error.response.data.message || 'Failed to upload resource');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('Server did not respond. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        toast.error('Error preparing request: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-resource">
      <h1>Upload New Resource</h1>
      
      {courseLoading ? (
        <div className="loading">Loading courses...</div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={onChange}
              placeholder="Enter resource title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              placeholder="Enter resource description"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="course">Course*</label>
            <select
              id="course"
              name="course"
              value={course}
              onChange={onChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="resourceType">Resource Type*</label>
            <select
              id="resourceType"
              name="resourceType"
              value={resourceType}
              onChange={onChange}
              required
            >
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="link">External Link</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {(resourceType === 'document' || resourceType === 'video') && (
            <div className="form-group">
              <label htmlFor="fileUrl">File URL*</label>
              <input
                type="text"
                id="fileUrl"
                name="fileUrl"
                value={fileUrl}
                onChange={onChange}
                placeholder={resourceType === 'document' ? "Enter document URL" : "Enter video URL"}
                required
              />
            </div>
          )}
          
          {resourceType === 'link' && (
            <div className="form-group">
              <label htmlFor="externalLink">External Link*</label>
              <input
                type="text"
                id="externalLink"
                name="externalLink"
                value={externalLink}
                onChange={onChange}
                placeholder="Enter external link"
                required
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      )}
    </div>
  );
}

export default CreateResource; 