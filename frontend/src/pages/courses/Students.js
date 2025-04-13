import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function CourseStudents() {
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${id}`);
      setCourse(courseRes.data.data);
      
      // Fetch students for this course
      const studentsRes = await axios.get(`/api/users/students/course/${id}`);
      setStudents(studentsRes.data.data);
      
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching data');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="course-students">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>{course.name} - Students</h1>
          <p><strong>Course Code:</strong> {course.code}</p>
          
          {students.length === 0 ? (
            <p>No students enrolled in this course.</p>
          ) : (
            <div className="students-list">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
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

export default CourseStudents; 