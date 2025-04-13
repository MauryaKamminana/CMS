import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  
  const { user } = useAuth();
  const isProfessor = user && (user.role === 'faculty' || user.role === 'admin');

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `/api/assignments?page=${currentPage}`;
      if (filter) {
        url += `&course=${filter}`;
      }
      
      const res = await axios.get(url);
      
      if (res.data.success) {
        // Process assignments to ensure course is properly handled
        const processedAssignments = res.data.data.map(assignment => {
          const result = { ...assignment };
          
          // Handle course object if it exists
          if (result.course && typeof result.course === 'object') {
            result.courseName = result.course.name;
            result.courseCode = result.course.code;
            result.courseId = result.course._id;
          }
          
          // Handle createdBy object if it exists
          if (result.createdBy && typeof result.createdBy === 'object') {
            result.creatorName = result.createdBy.name;
          }
          
          return result;
        });
        
        setAssignments(processedAssignments);
        setTotalPages(Math.ceil(res.data.count / 10)); // Assuming 10 per page
      } else {
        toast.error('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="assignments-page">
      <div className="page-header">
        <h1>Assignments</h1>
        {isProfessor && (
          <Link to="/assignments/new" className="btn btn-primary">
            Create Assignment
          </Link>
        )}
      </div>
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="courseFilter">Filter by Course:</label>
          <select 
            id="courseFilter" 
            value={filter} 
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Courses</option>
            <option value="CS101">CS101 - Introduction to Programming</option>
            <option value="MATH201">MATH201 - Calculus</option>
            <option value="ENG105">ENG105 - Technical Writing</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading assignments...</div>
      ) : (
        <>
          {assignments.length === 0 ? (
            <div className="no-data">
              <p>No assignments found.</p>
            </div>
          ) : (
            <div className="assignments-grid">
              {assignments.map(assignment => (
                <div key={assignment._id} className={`assignment-card ${isOverdue(assignment.dueDate) ? 'overdue' : ''}`}>
                  <div className="assignment-header">
                    <h3>{assignment.title}</h3>
                    <span className={`status ${isOverdue(assignment.dueDate) ? 'overdue' : 'active'}`}>
                      {isOverdue(assignment.dueDate) ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                  <div className="assignment-body">
                    <p><strong>Course:</strong> {assignment.courseName || 'N/A'} ({assignment.courseCode || 'N/A'})</p>
                    <p><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</p>
                    <p><strong>Total Marks:</strong> {assignment.totalMarks}</p>
                  </div>
                  <div className="assignment-footer">
                    <Link to={`/assignments/${assignment._id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
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
        </>
      )}
    </div>
  );
}

export default Assignments; 