import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

function HealthCheck() {
  const [status, setStatus] = useState('checking');
  const [retries, setRetries] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get('/api/health');
        if (res.data.success) {
          setStatus('online');
          setError(null);
        } else {
          setStatus('error');
          setError('Health check returned unsuccessful status');
        }
      } catch (err) {
        console.error('Health check error:', err);
        setStatus('offline');
        setError(err.message);
        
        // Retry after 5 seconds, up to 3 times
        if (retries < 3) {
          setTimeout(() => {
            setRetries(prev => prev + 1);
          }, 5000);
        }
      }
    };

    checkHealth();
  }, [retries]);

  return (
    <div className="api-status">
      <div className={`status-indicator ${status}`}></div>
      <span>API Status: {status === 'checking' ? 'Checking...' : status === 'online' ? 'Online' : 'Offline'}</span>
      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
}

export default HealthCheck; 