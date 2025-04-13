const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'breakfast', 'Breakfast',
      'lunch', 'Lunch',
      'dinner', 'Dinner',
      'snacks', 'Snacks',
      'beverages', 'Beverages',
      'desserts', 'Desserts'
    ]
  },
  imageUrl: {
    type: String,
    default: 'no-image.jpg'
  },
  quantity: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add this before creating the model
ProductSchema.pre('save', function(next) {
  // Convert category to lowercase
  if (this.category) {
    this.category = this.category.toLowerCase();
  }
  next();
});

module.exports = mongoose.model('CanteenProduct', ProductSchema); 