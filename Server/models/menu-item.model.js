const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: 600
  },
  category: {
    type: String,
    trim: true,
    default: 'Subs',
    maxlength: 60
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'LBP'],
    default: 'USD'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

menuItemSchema.index({ category: 1, sortOrder: 1, name: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);