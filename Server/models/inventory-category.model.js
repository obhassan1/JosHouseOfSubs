const mongoose = require('mongoose');

const inventoryCategorySchema =
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      unique: true
    },

    sortOrder: {
      type: Number,
      default: 0
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model(
  'InventoryCategory',
  inventoryCategorySchema
);