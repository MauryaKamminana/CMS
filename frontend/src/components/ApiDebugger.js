import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ApiDebugger() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [debugInfo, setDebugInfo] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const checkApi = async () => {
      try {
        // Try health endpoint first
        const response = await axios.get('/api/health');
        setApiStatus(`API is online: ${response.data.message}`);
        
        // Then get debug info
        try {
          const debugResponse = await axios.get('/api/debug');
          setDebugInfo(debugResponse.data);
        } catch (debugError) {
          console.log('Debug endpoint not available:', debugError);
        }
      } catch (error) {
        console.error('API connection error:', error);
        setApiStatus('API connection error');
        setError(error);
      }
    };

    checkApi();
  }, []);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const testEchoEndpoint = async () => {
    try {
      const response = await axios.post('/api/debug/echo', {
        test: 'data',
        timestamp: new Date().toISOString()
      });
      alert('Echo test successful! Check console for details.');
      console.log('Echo response:', response.data);
    } catch (error) {
      alert('Echo test failed. Check console for details.');
      console.error('Echo test error:', error);
    }
  };

  return (
    <div className="api-debugger" style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px',
      background: '#f8f9fa',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      zIndex: 1000,
      fontSize: '12px',
      maxWidth: expanded ? '500px' : '250px',
      maxHeight: expanded ? '80vh' : '100px',
      overflow: 'auto',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>API Status</h4>
        <button 
          onClick={toggleExpanded}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {expanded ? '▼' : '▲'}
        </button>
      </div>
      
      <p style={{ 
        padding: '5px 10px', 
        borderRadius: '3px',
        backgroundColor: apiStatus.includes('online') ? '#d4edda' : '#f8d7da',
        color: apiStatus.includes('online') ? '#155724' : '#721c24'
      }}>
        {apiStatus}
      </p>
      
      {expanded && (
        <>
          {error && (
            <div style={{ marginTop: '10px' }}>
              <h5 style={{ margin: '5px 0' }}>Error Details:</h5>
              <p style={{ color: '#721c24' }}>Error: {error.message}</p>
              {error.response && (
                <>
                  <p>Status: {error.response.status}</p>
                  <pre style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '5px', 
                    borderRadius: '3px',
                    overflow: 'auto',
                    fontSize: '11px'
                  }}>
                    {JSON.stringify(error.response.data, null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}
          
          {debugInfo && (
            <div style={{ marginTop: '10px' }}>
              <h5 style={{ margin: '5px 0' }}>Debug Info:</h5>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '5px', 
                borderRadius: '3px',
                overflow: 'auto',
                fontSize: '11px'
              }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={testEchoEndpoint}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Test Echo Endpoint
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ApiDebugger; 