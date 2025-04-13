import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axiosConfig';

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  heading: {
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    minHeight: '120px',
    resize: 'vertical'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  attachmentsSection: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px'
  },
  attachmentsList: {
    listStyle: 'none',
    padding: '0',
    marginBottom: '15px'
  },
  attachmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    marginBottom: '5px',
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: '4px'
  },
  addAttachment: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  btnAdd: {
    padding: '8px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  btnRemove: {
    padding: '3px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  helpText: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px'
  },
  btnCreate: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  btnCancel: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  }
};

function CreateAssignment() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    points: 100,
    attachments: []
  });
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentLink, setAttachmentLink] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/users/courses');
        if (response.data.success) {
          setCourses(response.data.data);
          if (response.data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              course: response.data.data[0]._id
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      }
    };
    
    fetchCourses();
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleAddAttachment = () => {
    if (attachmentName && attachmentLink) {
      setFormData({
        ...formData,
        attachments: [
          ...formData.attachments,
          { name: attachmentName, link: attachmentLink }
        ]
      });
      setAttachmentName('');
      setAttachmentLink('');
    }
  };
  
  const handleRemoveAttachment = (index) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments.splice(index, 1);
    setFormData({
      ...formData,
      attachments: updatedAttachments
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const dataToSubmit = {
        ...formData,
        points: Number(formData.points)
      };
      
      console.log('Submitting assignment data:', dataToSubmit);
      
      const response = await axios.post('/api/assignments', dataToSubmit);
      
      if (response.data.success) {
        toast.success('Assignment created successfully');
        navigate('/assignments');
      } else {
        toast.error(response.data.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.response?.data?.message || 'Error creating assignment');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Create New Assignment</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="title">Title*</label>
          <input
            style={styles.input}
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="description">Description*</label>
          <textarea
            style={styles.textarea}
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="course">Course*</label>
          <select
            style={styles.select}
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
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
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="dueDate">Due Date*</label>
          <input
            style={styles.input}
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="points">Total Marks</label>
          <input
            style={styles.input}
            type="number"
            id="points"
            name="points"
            value={formData.points}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        
        <div style={styles.attachmentsSection}>
          <label style={styles.label}>Attachments</label>
          <ul style={styles.attachmentsList}>
            {formData.attachments.map((attachment, index) => (
              <li key={index} style={styles.attachmentItem}>
                {attachment.name} - <a href={attachment.link} target="_blank" rel="noopener noreferrer">{attachment.link}</a>
                <button 
                  style={styles.btnRemove}
                  type="button" 
                  onClick={() => handleRemoveAttachment(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          
          <div style={styles.addAttachment}>
            <input
              style={styles.input}
              type="text"
              placeholder="Attachment Name (optional)"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Attachment Link"
              value={attachmentLink}
              onChange={(e) => setAttachmentLink(e.target.value)}
            />
            <button 
              style={styles.btnAdd}
              type="button" 
              onClick={handleAddAttachment}
            >
              Add
            </button>
          </div>
          <p style={styles.helpText}>Add links to external resources, documents, or files for students.</p>
        </div>
        
        <div style={styles.formActions}>
          <button 
            style={styles.btnCreate}
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
          <button 
            style={styles.btnCancel}
            type="button" 
            onClick={() => navigate('/assignments')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAssignment; 