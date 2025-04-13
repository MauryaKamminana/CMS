const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  degree: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  experience: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  resumeLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Shortlisted', 'Rejected', 'Selected', 'On Hold'],
    default: 'Pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound index to prevent duplicate applications
JobApplicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', JobApplicationSchema); 