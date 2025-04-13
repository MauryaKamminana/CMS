import React from 'react';

const Divider = ({ color = "#e0e0e0" }) => {
  return (
    <div className="divider-container">
      <svg 
        height="4" 
        width="100%" 
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
      >
        <line 
          x1="0" 
          y1="2" 
          x2="100" 
          y2="2" 
          stroke={color} 
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default Divider; 