import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      setUsers(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching users');
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data.data);
    } catch (error) {
      toast.error('Error fetching courses');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [fetchUsers, fetchCourses]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Error updating user role');
    }
  };

  const handleEnrollUser = (user) => {
    setSelectedUser(user);
    setShowEnrollForm(true);
    
    // Pre-select courses the user is already enrolled in
    setSelectedCourses(user.enrolledCourses || []);
  };

  const handleCourseSelection = (courseId) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const submitEnrollment = async () => {
    try {
      await axios.put(`/api/users/${selectedUser._id}/enroll`, {
        courses: selectedCourses
      });
      toast.success('User enrolled successfully');
      setShowEnrollForm(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Error enrolling user');
    }
  };

  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      {showEnrollForm && selectedUser ? (
        <div className="enroll-form">
          <h2>Enroll {selectedUser.name} to Courses</h2>
          <p>Select courses for this user:</p>
          
          <div className="course-selection">
            {courses.map(course => (
              <div key={course._id} className="course-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => handleCourseSelection(course._id)}
                  />
                  {course.name} ({course.code})
                </label>
              </div>
            ))}
          </div>
          
          <div className="form-actions">
            <button 
              onClick={() => {
                setShowEnrollForm(false);
                setSelectedUser(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button onClick={submitEnrollment} className="btn btn-primary">
              Save Enrollment
            </button>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="users-list">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Enrolled Courses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        {user.enrolledCourses?.length || 0} courses
                      </td>
                      <td>
                        <button 
                          onClick={() => handleEnrollUser(user)} 
                          className="btn btn-sm btn-primary"
                        >
                          Manage Enrollment
                        </button>
                      </td>
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

export default UserManagement; 