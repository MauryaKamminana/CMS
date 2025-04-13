import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function CourseAttendance() {
  const [course, setCourse] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtering, setFiltering] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${courseId}`);
      if (courseRes.data.success) {
        setCourse(courseRes.data.data);
      } else {
        toast.error('Failed to load course details');
      }
      
      // Build query params for date filtering
      let queryParams = '';
      if (startDate && endDate) {
        queryParams = `?startDate=${startDate}&endDate=${endDate}`;
      } else if (startDate) {
        queryParams = `?startDate=${startDate}`;
      } else if (endDate) {
        queryParams = `?endDate=${endDate}`;
      }
      
      // Fetch attendance records
      const attendanceRes = await axios.get(`/api/courses/${courseId}/attendance${queryParams}`);
      if (attendanceRes.data.success) {
        setAttendance(attendanceRes.data.data);
      } else {
        toast.error('Failed to load attendance records');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Error loading attendance data');
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  }, [courseId, startDate, endDate]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleFilter = (e) => {
    e.preventDefault();
    setFiltering(true);
    fetchData();
  };
  
  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFiltering(true);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Build query params for date filtering
      let queryParams = `?course=${courseId}`;
      if (startDate && endDate) {
        queryParams += `&startDate=${startDate}&endDate=${endDate}`;
      } else if (startDate) {
        queryParams += `&startDate=${startDate}`;
      } else if (endDate) {
        queryParams += `&endDate=${endDate}`;
      }
      
      // Use axios to get the CSV file
      const response = await axios.get(`/api/attendance/export${queryParams}`, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${course.code}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Attendance data exported successfully');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast.error('Failed to export attendance data');
    } finally {
      setExporting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading attendance data...</div>;
  }
  
  if (!course) {
    return <div className="not-found">Course not found</div>;
  }
  
  return (
    <div className="course-attendance-page">
      <div className="page-header">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline-secondary back-button"
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div>
          <h1>{course.name} - Attendance</h1>
          <p className="course-code">Course Code: {course.code}</p>
        </div>
      </div>
      
      {user.role === 'faculty' || user.role === 'admin' ? (
        <div className="faculty-actions">
          <Link to={`/courses/${courseId}/attendance/mark`} className="btn btn-primary">
            Mark Attendance
          </Link>
          <button 
            onClick={handleExport} 
            className="btn btn-success"
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </button>
        </div>
      ) : null}
      
      <div className="filter-section">
        <h2>Filter by Date</h2>
        <form onSubmit={handleFilter}>
          <div className="filter-inputs">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary" disabled={filtering}>
              {filtering ? 'Filtering...' : 'Apply Filter'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleReset}
              disabled={filtering || (!startDate && !endDate)}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {attendance.length === 0 ? (
        <div className="no-records">
          <p>No attendance records found for this course.</p>
          {user.role === 'faculty' || user.role === 'admin' ? (
            <div className="empty-actions">
              <Link to={`/courses/${courseId}/attendance/mark`} className="btn btn-primary">
                Mark Attendance Now
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="attendance-records">
          {user.role === 'student' ? (
            // Student view - show their own attendance
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => (
                  <tr key={record._id} className={`status-${record.status}`}>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Faculty view - show all students' attendance
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => (
                  <tr key={record._id} className={`status-${record.status}`}>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.student?.name || 'Unknown'}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseAttendance; 