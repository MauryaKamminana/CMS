import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import '../../styles/admin.css';

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Use location to detect navigation changes
  const location = useLocation();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('Fetching courses...');
      const res = await axios.get(`/api/courses?page=${currentPage}&limit=10`, {
        // Add cache busting parameter
        params: {
          _t: new Date().getTime()
        }
      });
      
      console.log('Courses response:', res.data);
      
      if (res.data.success) {
        setCourses(res.data.data);
        
        // Calculate total pages
        const total = res.data.pagination?.next 
          ? (res.data.pagination.next.page) * 10 
          : res.data.count;
        
        setTotalPages(Math.ceil(total / 10));
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error loading courses');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Refresh when component mounts, when location changes, or when refreshTrigger changes
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, location, refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the course "${name}"?`)) {
      try {
        const res = await axios.delete(`/api/courses/${id}`);
        
        if (res.data.success) {
          toast.success('Course deleted successfully');
          setRefreshTrigger(prev => prev + 1);
        } else {
          toast.error(res.data.message || 'Failed to delete course');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error(error.response?.data?.message || 'Error deleting course');
      }
    }
  };

  // Add a manual refresh button
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1>Course Management</h1>
        <p>Create courses, assign faculty, and enroll students</p>
        
        <div className="action-buttons">
          <Link to="/admin/courses/create" className="btn btn-primary">
            Create New Course
          </Link>
          <button onClick={handleRefresh} className="btn btn-secondary">
            Refresh List
          </button>
        </div>
      </div>
      
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Faculty</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">Loading courses...</td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No courses found</td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course._id}>
                  <td>{course.name}</td>
                  <td>{course.code}</td>
                  <td>{course.faculty?.length || 0}</td>
                  <td>{course.students?.length || 0}</td>
                  <td className="actions">
                    <Link to={`/admin/courses/${course._id}`} className="btn btn-sm btn-secondary">
                      View
                    </Link>
                    <Link to={`/admin/courses/${course._id}/edit`} className="btn btn-sm btn-primary">
                      Edit
                    </Link>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(course._id, course.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default CourseManagement; 