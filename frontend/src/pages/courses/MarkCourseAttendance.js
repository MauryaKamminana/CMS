import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function MarkCourseAttendance() {
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchCourseAndStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${courseId}`);
      if (!courseRes.data.success) {
        setError('Failed to load course details');
        toast.error('Failed to load course details');
        return;
      }
      
      setCourse(courseRes.data.data);
      
      // Fetch enrolled students
      const studentsRes = await axios.get(`/api/courses/${courseId}/students`);
      if (!studentsRes.data.success) {
        setError('Failed to load students');
        toast.error('Failed to load students');
        return;
      }
      
      // Make sure we have student data
      if (!studentsRes.data.data || !Array.isArray(studentsRes.data.data) || studentsRes.data.data.length === 0) {
        setStudents([]);
        return;
      }
      
      // Initialize students with present status by default
      const initializedStudents = studentsRes.data.data.map(student => ({
        ...student,
        id: student._id,
        status: 'present'
      }));
      
      setStudents(initializedStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error loading course data: ' + (error.response?.data?.message || error.message));
      toast.error('Error loading course data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);
  
  useEffect(() => {
    fetchCourseAndStudents();
  }, [fetchCourseAndStudents]);
  
  const handleStatusChange = (studentId, status) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      
      console.log('Submitting attendance data:', {
        date: attendanceDate,
        students: students.map(({ id, status }) => ({ id, status }))
      });
      
      const response = await axios.post(`/api/courses/${courseId}/attendance`, {
        date: attendanceDate,
        students: students.map(({ id, status }) => ({ id, status }))
      });
      
      if (response.data.success) {
        toast.success('Attendance marked successfully');
        navigate(`/courses/${courseId}/attendance`);
      } else {
        toast.error(response.data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Error marking attendance');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading course data...</div>
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
            onClick={fetchCourseAndStudents}
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
  
  if (!course) {
    return (
      <div className="not-found">
        <h2>Course not found</h2>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="mark-attendance-page">
      <h1>Mark Attendance</h1>
      <div className="course-info">
        <h2>{course.name}</h2>
        <p className="course-code">Course Code: {course.code}</p>
        <p className="course-description">{course.description}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="attendanceDate">Attendance Date:</label>
          <input
            type="date"
            id="attendanceDate"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
            className="form-control"
          />
        </div>
        
        {students.length === 0 ? (
          <div className="no-students alert alert-warning">
            <p>No students enrolled in this course. Please enroll students before marking attendance.</p>
            <Link to={`/courses/${courseId}/students`} className="btn btn-primary">
              Manage Students
            </Link>
          </div>
        ) : (
          <div className="students-list">
            <h3>Students ({students.length})</h3>
            <div className="quick-actions">
              <button 
                type="button" 
                className="btn btn-sm btn-outline-success"
                onClick={() => {
                  setStudents(students.map(student => ({...student, status: 'present'})));
                }}
              >
                Mark All Present
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  setStudents(students.map(student => ({...student, status: 'absent'})));
                }}
              >
                Mark All Absent
              </button>
            </div>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className={`status-${student.status}`}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        className={`status-select status-${student.status}`}
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
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting || students.length === 0}
          >
            {submitting ? 'Submitting...' : 'Mark Attendance'}
          </button>
          <Link to={`/courses/${courseId}/attendance`} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default MarkCourseAttendance; 