import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';

function ResourceDebug() {
  const { resourceId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const testResourceFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing resource fetch for ID:', resourceId);
      const response = await axios.get(`/api/resources/${resourceId}`);
      
      console.log('Response:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Resource Debug</h1>
      <p>Resource ID: {resourceId || 'None'}</p>
      
      <button 
        onClick={testResourceFetch}
        disabled={loading || !resourceId}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Resource Fetch'}
      </button>
      
      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '4px'
        }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724',
          borderRadius: '4px'
        }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ResourceDebug; 