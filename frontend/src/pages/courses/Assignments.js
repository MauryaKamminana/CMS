import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

function CourseAssignments() {
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const { user } = useAuth();
  
  const isFaculty = user && (user.role === 'faculty' || user.role === 'admin');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${id}`);
      if (courseRes.data.success) {
        setCourse(courseRes.data.data);
      }
      
      // Fetch assignments for this course
      const assignmentsRes = await axios.get(`/api/courses/${id}/assignments`);
      if (assignmentsRes.data.success) {
        // Process assignments to ensure proper data structure
        const processedAssignments = assignmentsRes.data.data.map(assignment => {
          const result = { ...assignment };
          
          // Handle createdBy object if it exists
          if (result.createdBy && typeof result.createdBy === 'object') {
            result.creatorName = result.createdBy.name;
          }
          
          return result;
        });
        
        setAssignments(processedAssignments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return <div className="loading">Loading assignments...</div>;
  }

  return (
    <div className="course-assignments">
      <h1>Assignments for {course?.name}</h1>
      
      {isFaculty && (
        <div className="actions">
          <Link to={`/assignments/new?course=${id}`} className="btn btn-primary">
            Create Assignment
          </Link>
        </div>
      )}
      
      {assignments.length === 0 ? (
        <div className="no-data">
          <p>No assignments found for this course.</p>
        </div>
      ) : (
        <div className="assignments-list">
          {assignments.map(assignment => (
            <div key={assignment._id} className={`assignment-item ${isOverdue(assignment.dueDate) ? 'overdue' : ''}`}>
              <div className="assignment-info">
                <h3>{assignment.title}</h3>
                <p><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</p>
                <p><strong>Total Marks:</strong> {assignment.totalMarks}</p>
                <p><strong>Status:</strong> {isOverdue(assignment.dueDate) ? 'Overdue' : 'Active'}</p>
              </div>
              <div className="assignment-actions">
                <Link to={`/assignments/${assignment._id}`} className="btn btn-primary">
                  View Details
                </Link>
                {isFaculty && (
                  <>
                    <Link to={`/assignments/edit/${assignment._id}`} className="btn btn-sm btn-secondary">
                      Edit
                    </Link>
                    <Link to={`/assignments/${assignment._id}/submissions`} className="btn btn-sm btn-info">
                      View Submissions
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseAssignments; 