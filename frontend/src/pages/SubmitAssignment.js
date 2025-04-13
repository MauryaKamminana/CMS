import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function SubmitAssignment() {
  const [assignment, setAssignment] = useState(null);
  const [formData, setFormData] = useState({
    submissionText: '',
    attachments: []
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const { submissionText, attachments } = formData;

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/assignments/${id}`);
      setAssignment(res.data.data);
      
      // Check if student has already submitted
      try {
        const subRes = await axios.get(`/api/assignments/${id}/submissions/student`);
        if (subRes.data.data) {
          toast.info('You have already submitted this assignment');
          navigate(`/assignments/${id}`);
        }
      } catch (error) {
        // No submission found, that's okay
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching assignment');
      navigate('/assignments');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionText && attachments.length === 0) {
      return toast.error('Please provide submission text or attachments');
    }
    
    setSubmitting(true);
    
    try {
      await axios.post(`/api/assignments/${id}/submissions`, formData);
      toast.success('Assignment submitted successfully');
      navigate(`/assignments/${id}`);
    } catch (error) {
      toast.error('Error submitting assignment');
    }
    
    setSubmitting(false);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <p>Loading assignment...</p>;
  }

  if (!assignment) {
    return <p>Assignment not found</p>;
  }

  if (isOverdue(assignment.dueDate)) {
    return (
      <div className="submit-assignment">
        <h1>Submit Assignment</h1>
        <div className="alert alert-danger">
          <p>This assignment is past its due date and can no longer be submitted.</p>
          <Link to={`/assignments/${id}`} className="btn btn-secondary">
            Back to Assignment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-assignment">
      <h1>Submit Assignment</h1>
      
      <div className="assignment-info">
        <h2>{assignment.title}</h2>
        <p><strong>Course:</strong> {assignment.course}</p>
        <p><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</p>
        <p><strong>Total Marks:</strong> {assignment.totalMarks}</p>
      </div>
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="submissionText">Submission Text</label>
          <textarea
            id="submissionText"
            name="submissionText"
            value={submissionText}
            onChange={onChange}
            placeholder="Enter your submission text"
            rows="8"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="attachments">Attachments (URLs, comma separated)</label>
          <input
            type="text"
            id="attachments"
            name="attachments"
            value={attachments}
            onChange={(e) => setFormData({ ...formData, attachments: e.target.value.split(',').map(url => url.trim()) })}
            placeholder="Enter attachment URLs separated by commas"
          />
        </div>
        
        <div className="submission-actions">
          <Link to={`/assignments/${id}`} className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SubmitAssignment; 