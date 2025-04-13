// Professor middleware
exports.professor = (req, res, next) => {
  if (req.user && (req.user.role === 'professor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only professors can access this resource'
    });
  }
}; 