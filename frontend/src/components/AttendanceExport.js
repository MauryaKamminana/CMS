import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';

function AttendanceExport() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  useEffect(() => {
    // Set default date range to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
    
    // Fetch courses
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/courses');
        
        if (response.data.success) {
          setCourses(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedCourse(response.data.data[0]._id);
          }
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
  
  const handleExport = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse || !startDate || !endDate) {
      toast.error('Please select a course and date range');
      return;
    }
    
    try {
      setExporting(true);
      
      console.log('Exporting attendance with params:', {
        course: selectedCourse,
        startDate,
        endDate
      });
      
      // Use axios with responseType blob for file download
      const response = await axios.post('/api/attendance/export', {
        course: selectedCourse,
        startDate,
        endDate
      }, {
        responseType: 'blob' // Important for file download
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get course name for the filename
      const course = courses.find(c => c._id === selectedCourse);
      const courseName = course ? course.code : 'course';
      
      link.setAttribute('download', `attendance_${courseName}_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Attendance exported successfully');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast.error('Failed to export attendance');
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <div className="attendance-export-container">
      <h2>Export Attendance</h2>
      
      <form onSubmit={handleExport}>
        <div className="form-group">
          <label htmlFor="exportCourse">Course*</label>
          <select
            id="exportCourse"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={loading || exporting}
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
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date*</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={exporting}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">End Date*</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={exporting}
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn-export"
          disabled={loading || exporting || !selectedCourse}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </form>
    </div>
  );
}

export default AttendanceExport; 