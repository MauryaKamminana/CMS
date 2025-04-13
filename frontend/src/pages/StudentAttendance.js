import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

function StudentAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0
  });

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = '/api/attendance/student';
      if (filter) {
        url += `?course=${filter}`;
      }
      
      const res = await axios.get(url);
      
      setAttendanceRecords(res.data.data);
      
      // Calculate statistics
      if (res.data.data.length > 0) {
        const total = res.data.data.length;
        const present = res.data.data.filter(record => record.status === 'present').length;
        const absent = res.data.data.filter(record => record.status === 'absent').length;
        const late = res.data.data.filter(record => record.status === 'late').length;
        
        setStats({
          total,
          present,
          absent,
          late
        });
      } else {
        setStats({
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        });
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching attendance records');
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'late':
        return 'status-late';
      default:
        return '';
    }
  };

  return (
    <div className="student-attendance">
      <h1>My Attendance</h1>
      
      <div className="attendance-stats">
        <div className="stat-card">
          <h3>Total Classes</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card present">
          <h3>Present</h3>
          <p>{stats.present} ({stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%)</p>
        </div>
        <div className="stat-card absent">
          <h3>Absent</h3>
          <p>{stats.absent} ({stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%)</p>
        </div>
        <div className="stat-card late">
          <h3>Late</h3>
          <p>{stats.late} ({stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}%)</p>
        </div>
      </div>
      
      <div className="filter-container">
        <label htmlFor="filter">Filter by Course:</label>
        <select 
          id="filter" 
          value={filter} 
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Courses</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Biology">Biology</option>
          <option value="Chemistry">Chemistry</option>
          <option value="English">English</option>
        </select>
      </div>
      
      {loading ? (
        <p>Loading attendance records...</p>
      ) : (
        <>
          {attendanceRecords.length === 0 ? (
            <p>No attendance records found</p>
          ) : (
            <div className="attendance-records">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(record => (
                    <tr key={record._id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.course}</td>
                      <td className={getStatusClass(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentAttendance; 