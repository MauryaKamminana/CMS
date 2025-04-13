import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

function AssignmentDetail() {
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isProfessor = user && (user.role === 'faculty' || user.role === 'admin');

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch assignment details
      const res = await axios.get(`/api/assignments/${id}`);
      
      if (res.data.success) {
        // Make sure we properly handle the course object
        const assignmentData = res.data.data;
        console.log('Fetched assignment data:', assignmentData);
        
        // If course is an object, extract needed properties
        if (assignmentData.course && typeof assignmentData.course === 'object') {
          assignmentData.courseId = assignmentData.course._id;
          assignmentData.courseName = assignmentData.course.name;
          assignmentData.courseCode = assignmentData.course.code;
        }
        
        setAssignment(assignmentData);
        
        // If user is a student, check if they have submitted
        if (user.role === 'student') {
          try {
            const submissionRes = await axios.get(`/api/assignments/${id}/submissions/student`);
            if (submissionRes.data.success && submissionRes.data.data) {
              setSubmission(submissionRes.data.data);
            }
          } catch (error) {
            console.error('Error fetching submission:', error);
          }
        }
      } else {
        toast.error('Failed to load assignment');
        navigate('/assignments');
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment');
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  const deleteAssignment = async () => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const res = await axios.delete(`/api/assignments/${id}`);
        
        if (res.data.success) {
          toast.success('Assignment deleted successfully');
          navigate('/assignments');
        } else {
          toast.error('Failed to delete assignment');
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error('Failed to delete assignment');
      }
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading assignment...</div>;
  }

  if (!assignment) {
    return <div className="not-found">Assignment not found</div>;
  }

  return (
    <div className="assignment-detail">
      <h1>{assignment.title}</h1>
      
      <div className="assignment-meta">
        <p><strong>Course:</strong> {assignment.courseName || 'N/A'} ({assignment.courseCode || 'N/A'})</p>
        <p><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</p>
        <p><strong>Total Marks:</strong> {assignment.totalMarks}</p>
        <p><strong>Status:</strong> {isOverdue(assignment.dueDate) ? 'Overdue' : 'Active'}</p>
      </div>
      
      <div className="assignment-description">
        <h2>Description</h2>
        <p>{assignment.description}</p>
      </div>
      
      <div className="assignment-attachments">
        <h3>Attachments</h3>
        {assignment.attachments && assignment.attachments.length > 0 ? (
          <ul className="attachment-list">
            {assignment.attachments.map((attachment, index) => (
              <li key={index} className="attachment-item">
                <a 
                  href={attachment.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="attachment-link"
                >
                  <i className="fas fa-file-alt"></i> {attachment.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-attachments">No attachments available</p>
        )}
      </div>
      
      {submission && (
        <div className="submission-info">
          <h2>Your Submission</h2>
          <p><strong>Submitted:</strong> {formatDate(submission.submittedAt)}</p>
          <p><strong>Status:</strong> {submission.status}</p>
          {submission.marks !== null && (
            <p><strong>Marks:</strong> {submission.marks} / {assignment.totalMarks}</p>
          )}
          {submission.feedback && (
            <div className="feedback">
              <h3>Feedback</h3>
              <p>{submission.feedback}</p>
            </div>
          )}
          <Link to={`/assignments/${id}/submission/${submission._id}`} className="btn btn-primary">
            View Submission
          </Link>
        </div>
      )}
      
      <div className="assignment-actions">
        <Link to="/assignments" className="btn btn-secondary">
          Back to Assignments
        </Link>
        
        {isProfessor && (
          <>
            <Link to={`/assignments/edit/${id}`} className="btn btn-primary">
              Edit
            </Link>
            <button onClick={deleteAssignment} className="btn btn-danger">
              Delete
            </button>
            <Link to={`/assignments/${id}/submissions`} className="btn btn-primary">
              View Submissions
            </Link>
          </>
        )}
        
        {!isProfessor && !submission && !isOverdue(assignment.dueDate) && (
          <Link to={`/assignments/${id}/submit`} className="btn btn-primary">
            Submit Assignment
          </Link>
        )}
      </div>
    </div>
  );
}

export default AssignmentDetail; 