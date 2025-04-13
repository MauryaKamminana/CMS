const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  jobType: {
    type: String,
    required: [true, 'Please add a job type'],
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract']
  },
  salary: {
    type: String
  },
  requirements: {
    type: String,
    required: [true, 'Please add job requirements']
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Please add an application deadline']
  },
  applicationLink: {
    type: String,
    trim: true
  },
  applicationProcess: {
    type: String,
    maxlength: [1000, 'Application process cannot be more than 1000 characters']
  },
  eligibility: {
    degrees: [String],
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot be more than 10']
    },
    batch: [String],
    additionalCriteria: String
  },
  attachments: [
    {
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      type: {
        type: String
      }
    }
  ],
  contactEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  contactPhone: {
    type: String
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Filled'],
    default: 'Open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for text search
JobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text',
  location: 'text'
});

// Virtual for applications
JobSchema.virtual('applications', {
  ref: 'JobApplication',
  localField: '_id',
  foreignField: 'job',
  justOne: false
});

module.exports = mongoose.model('Job', JobSchema); 