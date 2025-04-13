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
  
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchCourseAndStudents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${courseId}`);
      if (!courseRes.data.success) {
        toast.error('Failed to load course details');
        navigate('/attendance');
        return;
      }
      
      setCourse(courseRes.data.data);
      
      // Fetch enrolled students
      const studentsRes = await axios.get(`/api/courses/${courseId}/students`);
      if (!studentsRes.data.success) {
        toast.error('Failed to load students');
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
      toast.error('Error loading course data');
      navigate('/attendance');
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);
  
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
    
    try {
      setSubmitting(true);
      
      const response = await axios.post(`/api/courses/${courseId}/attendance`, {
        date: attendanceDate,
        students: students.map(({ id, status }) => ({ id, status }))
      });
      
      if (response.data.success) {
        toast.success('Attendance marked successfully');
        navigate(`/courses/${courseId}/attendance`);
      } else {
        toast.error('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.response?.data?.message || 'Error marking attendance');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading course data...</div>;
  }
  
  if (!course) {
    return <div className="not-found">Course not found</div>;
  }
  
  return (
    <div className="mark-attendance-page">
      <h1>Mark Attendance</h1>
      <div className="course-info">
        <h2>{course.name}</h2>
        <p className="course-code">{course.code}</p>
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
          />
        </div>
        
        {students.length === 0 ? (
          <div className="no-students">
            <p>No students enrolled in this course.</p>
          </div>
        ) : (
          <div className="students-list">
            <h3>Students</h3>
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