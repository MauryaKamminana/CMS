import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';

function SubmissionDetail() {
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { assignmentId, submissionId } = useParams();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch assignment details
      const assignmentRes = await axios.get(`/api/assignments/${assignmentId}`);
      if (assignmentRes.data.success) {
        const assignmentData = assignmentRes.data.data;
        
        // Process assignment data to handle course object
        if (assignmentData.course && typeof assignmentData.course === 'object') {
          assignmentData.courseName = assignmentData.course.name;
          assignmentData.courseCode = assignmentData.course.code;
        }
        
        setAssignment(assignmentData);
      } else {
        toast.error('Failed to load assignment');
        navigate('/assignments');
        return;
      }
      
      // Fetch submission details
      const submissionRes = await axios.get(`/api/assignments/${assignmentId}/submissions/${submissionId}`);
      if (submissionRes.data.success) {
        setSubmission(submissionRes.data.data);
      } else {
        toast.error('Failed to load submission');
        navigate(`/assignments/${assignmentId}`);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      toast.error('Failed to load submission details');
      navigate(`/assignments/${assignmentId}`);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, submissionId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading submission details...</div>;
  }

  if (!submission || !assignment) {
    return <div className="not-found">Submission not found</div>;
  }

  return (
    <div className="submission-detail">
      <h1>Submission Details</h1>
      
      <div className="assignment-info">
        <h2>Assignment: {assignment.title}</h2>
        <p><strong>Course:</strong> {assignment.courseName || 'N/A'} {assignment.courseCode ? `(${assignment.courseCode})` : ''}</p>
        <p><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</p>
        <p><strong>Total Marks:</strong> {assignment.totalMarks}</p>
      </div>
      
      <div className="submission-info card">
        <div className="card-header">
          <h3>Your Submission</h3>
          <span className={`status badge ${submission.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>
            {submission.status}
          </span>
        </div>
        
        <div className="card-body">
          <p><strong>Submitted:</strong> {formatDate(submission.submittedAt)}</p>
          
          {submission.text && (
            <div className="submission-text">
              <h4>Text Submission</h4>
              <div className="text-content">
                {submission.text}
              </div>
            </div>
          )}
          
          {submission.attachments && submission.attachments.length > 0 && (
            <div className="submission-attachments">
              <h4>Attachments</h4>
              <ul className="attachments-list">
                {submission.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a href={attachment} target="_blank" rel="noopener noreferrer">
                      Attachment {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {submission.status === 'graded' && (
            <div className="grading-info">
              <h4>Grading</h4>
              <p><strong>Marks:</strong> <span className="marks">{submission.marks}</span> / {assignment.totalMarks}</p>
              
              {submission.feedback && (
                <div className="feedback">
                  <h5>Feedback</h5>
                  <div className="feedback-content">
                    {submission.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="actions">
        <Link to={`/assignments/${assignmentId}`} className="btn btn-secondary">
          Back to Assignment
        </Link>
      </div>
    </div>
  );
}

export default SubmissionDetail; 