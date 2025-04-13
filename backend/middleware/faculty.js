// Middleware to check if user is faculty
exports.faculty = (req, res, next) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied, faculty role required'
    });
  }
  next();
}; 