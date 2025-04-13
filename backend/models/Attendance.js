const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index on course, student, and date to ensure uniqueness
// This ensures each student has a unique attendance record per course per day
AttendanceSchema.index({ course: 1, student: 1, date: 1 }, { unique: true });

// Explicitly remove any existing problematic index
// This is a workaround for MongoDB not allowing index changes in the schema
// if the collection already exists
mongoose.connection.on('connected', async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'attendances' }).toArray();
    
    if (collections.length > 0) {
      const indexes = await db.collection('attendances').indexes();
      
      for (const index of indexes) {
        if (index.name === 'course_1_date_1') {
          console.log('Dropping problematic index: course_1_date_1');
          await db.collection('attendances').dropIndex('course_1_date_1');
          break;
        }
      }
    }
  } catch (error) {
    console.error('Error checking/fixing indexes on startup:', error);
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema); 