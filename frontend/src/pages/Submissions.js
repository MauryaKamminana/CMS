import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

function Submissions() {
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch assignment details
      const assignmentRes = await axios.get(`/api/assignments/${id}`);
      if (assignmentRes.data.success) {
        const assignmentData = assignmentRes.data.data;
        
        // Handle course object if it exists
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
      
      // Fetch submissions for this assignment
      const submissionsRes = await axios.get(`/api/assignments/${id}/submissions`);
      if (submissionsRes.data.success) {
        // Process submissions to ensure proper data structure
        const processedSubmissions = submissionsRes.data.data.map(submission => {
          const result = { ...submission };
          
          // Handle student object if it exists
          if (result.student && typeof result.student === 'object') {
            result.studentName = result.student.name;
            result.studentEmail = result.student.email;
          }
          
          return result;
        });
        
        setSubmissions(processedSubmissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load submissions');
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gradeSubmission = async (submissionId, marks, feedback) => {
    // Add logging to debug
    console.log('Grading submission:', { submissionId, marks, feedback });
    console.log('Current user role:', user?.role);
    
    try {
      setGradingSubmissionId(submissionId);
      
      // Convert marks to a number and validate
      const numericMarks = Number(marks);
      if (isNaN(numericMarks)) {
        toast.error('Marks must be a number');
        return;
      }
      
      if (numericMarks < 0 || numericMarks > assignment.totalMarks) {
        toast.error(`Marks must be between 0 and ${assignment.totalMarks}`);
        return;
      }
      
      const res = await axios.put(`/api/assignments/${id}/submissions/${submissionId}/grade`, {
        marks: numericMarks,
        feedback: feedback
      });
      
      if (res.data.success) {
        toast.success('Submission graded successfully');
        fetchData(); // Refresh the data
      } else {
        toast.error(res.data.message || 'Failed to grade submission');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      
      // More detailed error reporting
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
        toast.error(error.response.data.message || 'Failed to grade submission');
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setGradingSubmissionId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="submissions-page">
      <h1>Submissions for {assignment.title}</h1>
      <p><strong>Course:</strong> {assignment.courseName || 'N/A'} {assignment.courseCode ? `(${assignment.courseCode})` : ''}</p>
      <p><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</p>
      <p><strong>Total Marks:</strong> {assignment.totalMarks}</p>
      
      <Link to={`/assignments/${id}`} className="btn btn-secondary mb-3">
        Back to Assignment
      </Link>
      
      {submissions.length === 0 ? (
        <div className="no-data">
          <p>No submissions yet.</p>
        </div>
      ) : (
        <div className="submissions-list">
          {submissions.map(submission => (
            <div key={submission._id} className="submission-card">
              <div className="submission-header">
                <h3>{submission.studentName || 'Student'}</h3>
                <span className="status">{submission.status}</span>
              </div>
              <div className="submission-body">
                <p><strong>Submitted:</strong> {formatDate(submission.submittedAt)}</p>
                {submission.text && (
                  <div className="submission-text">
                    <p><strong>Text Submission:</strong></p>
                    <p>{submission.text}</p>
                  </div>
                )}
                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="submission-attachments">
                    <p><strong>Attachments:</strong></p>
                    <ul>
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
                {submission.marks !== null && (
                  <div className="submission-grade">
                    <p><strong>Marks:</strong> {submission.marks} / {assignment.totalMarks}</p>
                    {submission.feedback && (
                      <div className="feedback">
                        <h4>Feedback</h4>
                        <p>{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="submission-footer">
                {submission.status !== 'graded' && (
                  <div className="grade-form">
                    <button 
                      className="btn btn-primary"
                      disabled={gradingSubmissionId === submission._id}
                      onClick={() => {
                        const marks = prompt(`Enter marks (out of ${assignment.totalMarks}):`);
                        if (marks !== null) {
                          const feedback = prompt('Enter feedback (optional):');
                          gradeSubmission(submission._id, marks, feedback || '');
                        }
                      }}
                    >
                      {gradingSubmissionId === submission._id ? 'Grading...' : 'Grade Submission'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Submissions; 