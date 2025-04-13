import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  // Fetch student's courses and recent assignments
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled courses
      const coursesRes = await axios.get('/api/users/courses');
      
      // Process the courses to ensure we have properly structured data
      if (coursesRes.data.success) {
        // Make sure we're working with an array of course objects
        const processedCourses = Array.isArray(coursesRes.data.data) 
          ? coursesRes.data.data.map(course => {
              // Ensure we handle both string IDs and full course objects
              if (typeof course === 'object') {
                return {
                  id: course._id,
                  name: course.name,
                  code: course.code,
                  description: course.description
                };
              } 
              return course; // if it's already a string ID
            })
          : [];
        
        setCourses(processedCourses);
      }
      
      // Fetch recent assignments
      const assignmentsRes = await axios.get('/api/assignments?limit=5');
      if (assignmentsRes.data.success) {
        setAssignments(assignmentsRes.data.data);
      }
      
      // Fetch recent resources
      const resourcesRes = await axios.get('/api/resources?limit=5');
      if (resourcesRes.data.success) {
        setResources(resourcesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      <p>Welcome, {user?.name || 'Student'}!</p>
      
      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>My Courses</h2>
            {courses.length === 0 ? (
              <p>You are not enrolled in any courses.</p>
            ) : (
              <ul className="course-list">
                {courses.map(course => (
                  <li key={course.id || course._id}>
                    <Link 
                      to={`/courses/${course.id || course._id}`}
                      className="course-link"
                    >
                      <span className="course-name">{course.name}</span>
                      {course.code && <span className="course-code">({course.code})</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/courses" className="dashboard-link">View All Courses</Link>
          </div>
          
          <div className="dashboard-card">
            <h2>Recent Assignments</h2>
            {assignments.length === 0 ? (
              <p>No recent assignments.</p>
            ) : (
              <ul>
                {assignments.map(assignment => (
                  <li key={assignment._id}>
                    <Link to={`/assignments/${assignment._id}`}>
                      {assignment.title}
                    </Link>
                    <span className="date-badge">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/assignments" className="dashboard-link">View All Assignments</Link>
          </div>
          
          <div className="dashboard-card">
            <h2>Recent Resources</h2>
            {resources.length === 0 ? (
              <p>No recent resources.</p>
            ) : (
              <ul>
                {resources.map(resource => (
                  <li key={resource._id}>
                    <Link to={`/resources/${resource._id}`}>
                      {resource.title}
                    </Link>
                    <span className="resource-type">
                      {resource.resourceType}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/resources" className="dashboard-link">View All Resources</Link>
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <h2>Campus Services</h2>
        <div className="course-grid">
          <div className="course-card">
            <h3>Canteen Services</h3>
            <p>Order food from the campus canteen</p>
            <div className="course-actions">
              <Link to="/canteen/dashboard" className="btn btn-sm">Go to Canteen</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard; 