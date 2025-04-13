import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import '../styles/attendance.css';

function MarkAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Set today's date as default when component mounts
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setAttendanceDate(formattedDate);
  }, []);
  
  // Fetch faculty's courses
  const fetchFacultyCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get courses where the user is a faculty
      const response = await axios.get('/api/attendance/faculty/courses');
      
      if (response.data.success) {
        setCourses(response.data.data);
      } else {
        setError('Failed to load your courses');
        toast.error('Failed to load your courses');
      }
    } catch (error) {
      console.error('Error fetching faculty courses:', error);
      setError('Error loading courses: ' + (error.response?.data?.message || error.message));
      toast.error('Error loading your courses');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch students for selected course
  const fetchCourseStudents = useCallback(async (courseId) => {
    if (!courseId) return;
    
    try {
      setCourseLoading(true);
      
      const response = await axios.get(`/api/courses/${courseId}/students`);
      
      if (response.data.success) {
        // Initialize students with present status by default
        const initializedStudents = response.data.data.map(student => ({
          ...student,
          id: student._id,
          status: 'present'
        }));
        
        setStudents(initializedStudents);
      } else {
        toast.error('Failed to load students for this course');
      }
    } catch (error) {
      console.error('Error fetching course students:', error);
      toast.error('Error loading students for this course');
    } finally {
      setCourseLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchFacultyCourses();
  }, [fetchFacultyCourses]);
  
  // When course selection changes, fetch students
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseStudents(selectedCourse);
    } else {
      setStudents([]);
    }
  }, [selectedCourse, fetchCourseStudents]);
  
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };
  
  const handleStatusChange = (studentId, status) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }
    
    if (!attendanceDate) {
      toast.error('Please select a date');
      return;
    }
    
    if (students.length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format the attendance data
      const attendanceData = {
        date: attendanceDate,
        students: students.map(student => ({
          id: student.id,
          status: student.status
        }))
      };
      
      console.log('Submitting attendance data for', students.length, 'students');
      
      const res = await axios.post(
        `/api/courses/${selectedCourse}/attendance`,
        attendanceData
      );
      
      if (res.data.success) {
        // Show detailed success message
        const { updated, created, failed } = res.data.data;
        
        if (failed > 0) {
          toast.warning(`Attendance partially marked. ${created} created, ${updated} updated, ${failed} failed.`);
        } else {
          toast.success(`Attendance marked successfully. ${created} created, ${updated} updated.`);
        }
        
        // Reset form
        setSelectedCourse('');
        setStudents([]);
        setAttendanceDate(new Date().toISOString().split('T')[0]);
      } else {
        toast.error(res.data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error marking attendance. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading your courses...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchFacultyCourses}
          >
            Try Again
          </button>
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mark-attendance-container">
      <h1>Mark Attendance</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="course">Course*</label>
          <select
            id="course"
            value={selectedCourse}
            onChange={handleCourseChange}
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
          <label htmlFor="attendanceDate">Attendance Date*</label>
          <input
            type="date"
            id="attendanceDate"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            required
          />
        </div>
        
        {courseLoading ? (
          <div className="loading">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="no-students">
            <p>No students enrolled in this course</p>
          </div>
        ) : (
          <>
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>
                        <select
                          value={student.status}
                          onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="excused">Excused</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-mark"
                disabled={submitting || students.length === 0}
              >
                {submitting ? 'Marking...' : 'Mark Attendance'}
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => navigate('/attendance')}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default MarkAttendance; 