// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  
  // Check for validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  // Check for duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }
  
  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = errorHandler; 