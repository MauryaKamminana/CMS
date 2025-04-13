// Import route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const canteenProductRoutes = require('./routes/canteenProductRoutes');
const canteenOrderRoutes = require('./routes/canteenOrderRoutes');
// Other imports...

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
// DON'T mount submissions routes directly here - they should be nested under assignments
app.use('/api/canteen/products', canteenProductRoutes);
app.use('/api/canteen/orders', canteenOrderRoutes);

// Add this before defining your routes
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// And at the end of your routes, catch 404s
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Rest of your app.js code... 