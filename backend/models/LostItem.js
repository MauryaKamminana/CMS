const mongoose = require('mongoose');

const LostItemSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Electronics', 'Books', 'Clothing', 'Accessories', 'Documents', 'Other']
  },
  location: {
    type: String,
    required: [true, 'Please add where the item was lost/found']
  },
  date: {
    type: Date,
    required: [true, 'Please add the date when the item was lost/found']
  },
  status: {
    type: String,
    enum: ['lost', 'found', 'claimed', 'returned'],
    default: 'lost'
  },
  contactInfo: {
    type: String,
    required: [true, 'Please add contact information']
  },
  image: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LostItem', LostItemSchema); 