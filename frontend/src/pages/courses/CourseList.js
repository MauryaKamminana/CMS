import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Define which API to call based on user role
        const endpoint = user.role === 'student' 
          ? '/api/users/courses' 
          : '/api/courses';
        
        const res = await axios.get(endpoint);
        
        if (res.data.success) {
          // Ensure we process course data consistently
          const processedCourses = res.data.data.map(course => {
            // If course is already a properly structured object, use it
            if (course && typeof course === 'object' && course._id) {
              return {
                id: course._id,
                name: course.name || 'Untitled Course',
                code: course.code || 'No Code',
                description: course.description || ''
              };
            }
            // If course is just an ID string, return a placeholder object
            return {
              id: course,
              name: 'Loading...',
              code: '',
              description: ''
            };
          });
          
          setCourses(processedCourses);
        } else {
          toast.error('Failed to load courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Error loading courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user.role]);

  return (
    <div className="courses-page">
      <h1>My Courses</h1>
      
      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : (
        <>
          {courses.length === 0 ? (
            <div className="no-data">
              <p>No courses found.</p>
              {user.role === 'student' && (
                <p>Please contact an administrator to enroll in courses.</p>
              )}
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-header">
                    <h2>{course.name}</h2>
                    <span className="course-code">{course.code}</span>
                  </div>
                  <div className="course-body">
                    <p>{course.description}</p>
                  </div>
                  <div className="course-footer">
                    <Link to={`/courses/${course.id}`} className="btn btn-primary">
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CourseList; 