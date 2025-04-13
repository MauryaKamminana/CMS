import React from 'react';

const Separator = ({ color = "#e0e0e0", height = 4 }) => {
  return (
    <div className="separator">
      <svg 
        height={height} 
        width="100%" 
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        <line 
          x1="0" 
          y1={height/2} 
          x2="100" 
          y2={height/2} 
          stroke={color} 
          strokeWidth={height}
        />
      </svg>
    </div>
  );
};

export default Separator; 