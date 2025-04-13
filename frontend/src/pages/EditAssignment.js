import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';

function EditAssignment() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [attachmentLink, setAttachmentLink] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch assignment details
  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      
      const res = await axios.get(`/api/assignments/${id}`);
      
      if (res.data.success) {
        const assignment = res.data.data;
        setTitle(assignment.title);
        setDescription(assignment.description);
        
        // Handle course ID correctly
        if (typeof assignment.course === 'object') {
          setCourse(assignment.course._id);
        } else {
          setCourse(assignment.course);
        }
        
        // Format date for datetime-local input
        const dueDate = new Date(assignment.dueDate);
        const formattedDate = dueDate.toISOString().slice(0, 16);
        setDueDate(formattedDate);
        
        setTotalMarks(assignment.totalMarks);
        setAttachments(assignment.attachments || []);
        
        console.log('Loaded assignment:', assignment);
      } else {
        toast.error('Failed to load assignment');
        navigate('/assignments');
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Error loading assignment');
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);
  
  // Fetch faculty's courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get('/api/users/courses');
      
      if (res.data.success) {
        setCourses(res.data.data);
        console.log('Loaded courses:', res.data.data);
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error loading courses');
    }
  }, []);
  
  useEffect(() => {
    fetchAssignment();
    fetchCourses();
  }, [fetchAssignment, fetchCourses]);
  
  const handleAddAttachment = () => {
    if (!attachmentLink.trim()) {
      toast.error('Please enter an attachment link');
      return;
    }
    
    const name = attachmentName.trim() || `Attachment ${attachments.length + 1}`;
    
    setAttachments([...attachments, { name, link: attachmentLink }]);
    setAttachmentLink('');
    setAttachmentName('');
  };
  
  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !course || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const assignmentData = {
        title,
        description,
        course,
        dueDate,
        totalMarks,
        attachments
      };
      
      console.log('Submitting updated assignment data:', assignmentData);
      
      const res = await axios.put(`/api/assignments/${id}`, assignmentData);
      
      if (res.data.success) {
        console.log('Assignment updated successfully:', res.data);
        toast.success('Assignment updated successfully');
        navigate(`/assignments/${id}`);
      } else {
        toast.error(res.data.message || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error(error.response?.data?.message || 'Error updating assignment');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading assignment...</div>;
  }
  
  return (
    <div className="edit-assignment-page">
      <h1>Edit Assignment</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title<span className="required">*</span></label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter assignment title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description<span className="required">*</span></label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter assignment description"
            rows="6"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="course">Course<span className="required">*</span></label>
          <select
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          >
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">Due Date<span className="required">*</span></label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="totalMarks">Total Marks</label>
          <input
            type="number"
            id="totalMarks"
            value={totalMarks}
            onChange={(e) => setTotalMarks(parseInt(e.target.value))}
            min="1"
            max="1000"
          />
        </div>
        
        <div className="form-group attachments-section">
          <label>Attachments</label>
          
          <div className="attachment-list">
            {attachments.length > 0 ? (
              <ul>
                {attachments.map((attachment, index) => (
                  <li key={index} className="attachment-item">
                    <a href={attachment.link} target="_blank" rel="noopener noreferrer">
                      {attachment.name}
                    </a>
                    <button 
                      type="button" 
                      className="btn-remove" 
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-attachments">No attachments added yet.</p>
            )}
          </div>
          
          <div className="add-attachment">
            <div className="attachment-inputs">
              <input
                type="text"
                placeholder="Attachment Name (optional)"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
              />
              <input
                type="url"
                placeholder="Attachment Link"
                value={attachmentLink}
                onChange={(e) => setAttachmentLink(e.target.value)}
              />
              <button 
                type="button" 
                className="btn-add" 
                onClick={handleAddAttachment}
              >
                Add
              </button>
            </div>
            <small className="attachment-help">
              Add links to external resources, documents, or files for students.
            </small>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Assignment'}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate(`/assignments/${id}`)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAssignment; 