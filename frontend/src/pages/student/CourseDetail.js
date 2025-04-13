import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';

function StudentCourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      // Use the regular course endpoint since we're already checking role in the route
      const res = await axios.get(`/api/courses/${id}`);
      
      if (res.data.success) {
        setCourse(res.data.data);
      } else {
        toast.error('Failed to load course details');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Error loading course details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (!course) {
    return <div className="not-found">Course not found</div>;
  }

  return (
    <div className="course-detail-page">
      <div className="course-header">
        <h1>{course.name}</h1>
        <p className="course-code">{course.code}</p>
        <div className="course-info">
          <p className="description">{course.description}</p>
        </div>
      </div>

      <div className="course-content">
        <div className="nav-grid">
          <Link to={`/courses/${id}/assignments`} className="nav-item">
            <div className="nav-item-content">
              <h3>Assignments</h3>
              <p>View and submit your assignments</p>
            </div>
          </Link>

          <Link to={`/courses/${id}/resources`} className="nav-item">
            <div className="nav-item-content">
              <h3>Course Resources</h3>
              <p>Access study materials and resources</p>
            </div>
          </Link>

          <Link to={`/courses/${id}/attendance`} className="nav-item">
            <div className="nav-item-content">
              <h3>My Attendance</h3>
              <p>View your attendance record</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="actions">
        <Link to="/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default StudentCourseDetail; 