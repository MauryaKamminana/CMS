const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  points: {
    type: Number,
    required: [true, 'Please add points'],
    min: [0, 'Points cannot be negative']
  },
  // For backward compatibility
  totalMarks: {
    type: Number,
    min: [0, 'Total marks cannot be negative']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  attachments: [
    {
      name: {
        type: String
      },
      link: {
        type: String,
        required: true
      }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for totalMarks (for backward compatibility)
AssignmentSchema.virtual('totalMarksVirtual').get(function() {
  return this.points;
});

// Pre-save middleware to ensure totalMarks is set if points is provided
AssignmentSchema.pre('save', function(next) {
  if (this.points && !this.totalMarks) {
    this.totalMarks = this.points;
  } else if (this.totalMarks && !this.points) {
    this.points = this.totalMarks;
  }
  next();
});

module.exports = mongoose.model('Assignment', AssignmentSchema); 