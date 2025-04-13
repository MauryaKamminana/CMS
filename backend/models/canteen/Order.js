const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CanteenProduct',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount must be positive']
  },
  status: {
    type: String,
    enum: ['pending', 'Pending', 'processing', 'Processing', 'ready', 'Ready', 'completed', 'Completed', 'cancelled', 'Cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'Pending', 'completed', 'Completed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'Cash', 'online', 'Online'],
    default: 'cash'
  },
  pickupTime: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save hook to standardize case
OrderSchema.pre('save', function(next) {
  // Convert paymentMethod to lowercase
  if (this.paymentMethod) {
    this.paymentMethod = this.paymentMethod.toLowerCase();
  }
  
  // Convert status to lowercase
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
  
  // Convert paymentStatus to lowercase
  if (this.paymentStatus) {
    this.paymentStatus = this.paymentStatus.toLowerCase();
  }
  
  next();
});

module.exports = mongoose.model('CanteenOrder', OrderSchema); 