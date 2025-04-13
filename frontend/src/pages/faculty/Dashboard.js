import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

function FacultyDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="faculty-dashboard">
      <h1>Faculty Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      
      <div className="dashboard-actions">
        <Link to="/assignments" className="btn btn-primary">View All Assignments</Link>
        <Link to="/resources" className="btn btn-primary">View All Resources</Link>
        <Link to="/attendance" className="btn btn-primary">View Attendance Records</Link>
      </div>
      
      <h2>Your Courses</h2>
      
      {courses.length === 0 ? (
        <div className="alert alert-info">
          You don't have any courses assigned. Please contact an administrator.
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <h3>{course.name}</h3>
              <p><strong>Code:</strong> {course.code}</p>
              <p>{course.description}</p>
              
              <div className="course-actions">
                <Link to={`/courses/${course._id}/assignments`} className="btn btn-sm">Assignments</Link>
                <Link to={`/courses/${course._id}/resources`} className="btn btn-sm">Resources</Link>
                <Link to={`/courses/${course._id}/attendance`} className="btn btn-sm">Attendance</Link>
                <Link to={`/courses/${course._id}/students`} className="btn btn-sm">Students</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <h2>Quick Actions</h2>
      <div className="quick-actions">
        <Link to="/assignments/new" className="btn btn-success">Create Assignment</Link>
        <Link to="/resources/new" className="btn btn-success">Upload Resource</Link>
        <Link to="/attendance/mark" className="btn btn-success">Mark Attendance</Link>
        <Link to="/canteen/dashboard" className="btn btn-success">Canteen Services</Link>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>Canteen Services</h3>
        </div>
        <div className="card-body">
          <p>Order food from the campus canteen</p>
          <div className="action-buttons">
            <Link to="/canteen/dashboard" className="btn btn-primary">
              Go to Canteen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard; 