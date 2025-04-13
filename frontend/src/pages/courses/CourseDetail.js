import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/courses/${id}`);
      
      if (res.data.success) {
        setCourse(res.data.data);
      } else {
        toast.error('Failed to load course details');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Error loading course details');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
      <h1>{course.name}</h1>
      <p className="course-code">{course.code}</p>
      
      <div className="course-info">
        <p className="description">{course.description}</p>
      </div>

      <div className="course-navigation">
        <div className="nav-grid">
          <Link to={`/courses/${id}/assignments`} className="nav-item">
            <h3>Assignments</h3>
            <p>View and submit course assignments</p>
          </Link>

          <Link to={`/courses/${id}/resources`} className="nav-item">
            <h3>Resources</h3>
            <p>Access course materials and resources</p>
          </Link>

          {user.role === 'student' && (
            <Link to={`/courses/${id}/attendance`} className="nav-item">
              <h3>Attendance</h3>
              <p>View your attendance records</p>
            </Link>
          )}

          {(user.role === 'faculty' || user.role === 'admin') && (
            <>
              <Link to={`/courses/${id}/students`} className="nav-item">
                <h3>Students</h3>
                <p>Manage enrolled students</p>
              </Link>
              <Link to={`/courses/${id}/attendance`} className="nav-item">
                <h3>Attendance</h3>
                <p>Manage course attendance</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail; 