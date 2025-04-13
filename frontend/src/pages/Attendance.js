/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AttendanceExport from '../components/AttendanceExport';
import '../styles/attendance.css';

function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [courses, setCourses] = useState([]);
  const [showExport, setShowExport] = useState(false);
  
  const { user } = useAuth();

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `/api/attendance?page=${currentPage}&limit=5`;
      if (filter) {
        url += `&course=${filter}`;
      }
      
      if (dateRange.startDate && dateRange.endDate) {
        url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      
      const res = await axios.get(url);
      
      setAttendanceRecords(res.data.data);
      
      // Calculate total pages
      const total = res.data.pagination.next 
        ? (res.data.pagination.next.page) * 5 
        : res.data.count;
      
      setTotalPages(Math.ceil(total / 5));
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching attendance records');
      setLoading(false);
    }
  }, [currentPage, filter, dateRange]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/courses');
        setCourses(res.data.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    
    fetchCourses();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const applyDateFilter = () => {
    setCurrentPage(1);
    fetchAttendance();
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportAttendance = async () => {
    if (!filter) {
      return toast.error('Please select a course to export');
    }
    
    try {
      const params = {
        course: filter,
        startDate: dateRange.startDate || new Date().toISOString().split('T')[0],
        endDate: dateRange.endDate || new Date().toISOString().split('T')[0]
      };
      
      // Use POST method with responseType blob for file download
      const response = await axios.post('/api/attendance/export', params, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get course name for the filename
      const course = courses.find(c => c._id === filter);
      const courseName = course ? course.code : 'course';
      
      link.setAttribute('download', `attendance_${courseName}_${params.startDate}_to_${params.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Attendance exported successfully');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast.error('Failed to export attendance');
    }
  };

  const renderCourseOptions = () => {
    return courses.map(course => (
      <option key={course._id} value={course._id}>
        {course.name} ({course.code})
      </option>
    ));
  };

  const toggleExport = () => {
    setShowExport(!showExport);
  };

  if (loading) {
    return <div className="loading">Loading attendance records...</div>;
  }

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h1>Attendance Management</h1>
        {user && (user.role === 'admin' || user.role === 'faculty') && (
          <Link to="/attendance/mark" className="btn btn-primary">
            Mark Attendance
          </Link>
        )}
        <div className="attendance-actions">
          <button onClick={exportAttendance} className="btn btn-secondary">
            Export CSV
          </button>
          <button 
            className="btn btn-secondary"
            onClick={toggleExport}
          >
            {showExport ? 'Hide Export' : 'Export Attendance'}
          </button>
        </div>
      </div>
      
      {showExport && (
        <div className="export-section">
          <AttendanceExport />
        </div>
      )}
      
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="filter">Filter by Course:</label>
          <select 
            id="filter" 
            value={filter} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Courses</option>
            {renderCourseOptions()}
          </select>
        </div>
        
        <div className="date-filter">
          <div className="date-inputs">
            <div className="date-group">
              <label htmlFor="startDate">From:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            
            <div className="date-group">
              <label htmlFor="endDate">To:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
          
          <div className="date-actions">
            <button onClick={applyDateFilter} className="btn btn-sm btn-primary">
              Apply
            </button>
            <button onClick={clearDateFilter} className="btn btn-sm btn-secondary">
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {attendanceRecords.length === 0 ? (
        <div className="no-records">
          <p>No attendance records found</p>
          <Link to="/attendance/mark" className="btn btn-primary">
            Mark Attendance
          </Link>
        </div>
      ) : (
        <div className="attendance-records">
          <h2>Recent Attendance Records</h2>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(record => (
                <tr key={record._id}>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.course}</td>
                  <td>{record.students.filter(s => s.status === 'present').length}</td>
                  <td>{record.students.filter(s => s.status === 'absent').length}</td>
                  <td>{record.students.filter(s => s.status === 'late').length}</td>
                  <td>
                    <Link to={`/attendance/${record._id}`} className="btn btn-sm btn-view">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Attendance; 