import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableFaculty, setAvailableFaculty] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/courses/${id}`);
      setCourse(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching course details');
      navigate('/admin/courses');
    }
  }, [id, navigate]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      
      // Fetch available faculty
      const facultyRes = await axios.get('/api/users?role=faculty');
      setAvailableFaculty(facultyRes.data.data);
      
      // Fetch available students
      const studentsRes = await axios.get('/api/users?role=student');
      setAvailableStudents(studentsRes.data.data);
      
      setLoadingUsers(false);
    } catch (error) {
      toast.error('Error fetching available users');
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchCourse();
    fetchAvailableUsers();
  }, [fetchCourse, fetchAvailableUsers]);

  const handleAddFaculty = async () => {
    if (!selectedFaculty) {
      return toast.error('Please select a faculty member');
    }
    
    try {
      await axios.post(`/api/courses/${id}/faculty`, {
        facultyId: selectedFaculty
      });
      
      toast.success('Faculty added to course');
      setSelectedFaculty('');
      fetchCourse();
    } catch (error) {
      toast.error('Error adding faculty to course');
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) {
      return toast.error('Please select a student');
    }
    
    try {
      await axios.post(`/api/courses/${id}/students`, {
        studentId: selectedStudent
      });
      
      toast.success('Student enrolled in course');
      setSelectedStudent('');
      fetchCourse();
    } catch (error) {
      toast.error('Error enrolling student');
    }
  };

  const handleRemoveFaculty = async (facultyId) => {
    try {
      await axios.delete(`/api/courses/${id}/faculty/${facultyId}`);
      toast.success('Faculty removed from course');
      fetchCourse();
    } catch (error) {
      toast.error('Error removing faculty');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`/api/courses/${id}/students/${studentId}`);
      toast.success('Student removed from course');
      fetchCourse();
    } catch (error) {
      toast.error('Error removing student');
    }
  };

  return (
    <div className="course-detail">
      {loading ? (
        <p>Loading course details...</p>
      ) : (
        <>
          <h1>{course.name}</h1>
          <p><strong>Course Code:</strong> {course.code}</p>
          <p><strong>Description:</strong> {course.description}</p>
          
          <div className="course-actions">
            <Link to="/admin/courses" className="btn btn-secondary">
              Back to Courses
            </Link>
            <Link to={`/admin/courses/${id}/edit`} className="btn btn-primary">
              Edit Course
            </Link>
          </div>
          
          <div className="faculty-section">
            <h2>Faculty</h2>
            
            <div className="add-faculty">
              <select 
                value={selectedFaculty} 
                onChange={(e) => setSelectedFaculty(e.target.value)}
                disabled={loadingUsers}
              >
                <option value="">Select Faculty</option>
                {availableFaculty.map(faculty => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name} ({faculty.email})
                  </option>
                ))}
              </select>
              <button 
                onClick={handleAddFaculty} 
                className="btn btn-primary"
                disabled={loadingUsers || !selectedFaculty}
              >
                Add Faculty
              </button>
            </div>
            
            {course.faculty && course.faculty.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {course.faculty.map(faculty => (
                    <tr key={faculty._id}>
                      <td>{faculty.name}</td>
                      <td>{faculty.email}</td>
                      <td>
                        <button 
                          onClick={() => handleRemoveFaculty(faculty._id)} 
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No faculty assigned to this course.</p>
            )}
          </div>
          
          <div className="students-section">
            <h2>Students</h2>
            
            <div className="add-student">
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={loadingUsers}
              >
                <option value="">Select Student</option>
                {availableStudents.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              <button 
                onClick={handleAddStudent} 
                className="btn btn-primary"
                disabled={loadingUsers || !selectedStudent}
              >
                Enroll Student
              </button>
            </div>
            
            {course.students && course.students.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {course.students.map(student => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>
                        <button 
                          onClick={() => handleRemoveStudent(student._id)} 
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No students enrolled in this course.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CourseDetail; 