const mongoose = require('mongoose');

const inventoryMovementSchema =
  new mongoose.Schema({
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: true,
      index: true
    },

    materialName: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ['add', 'remove'],
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.000001
    },

    unit: {
      type: String,
      required: true,
      trim: true
    },

    previousQuantity: {
      type: Number,
      required: true,
      min: 0
    },

    newQuantity: {
      type: Number,
      required: true,
      min: 0
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    accountUsername: {
      type: String,
      required: true,
      trim: true
    },

    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500
    }
  }, {
    timestamps: true
  });

inventoryMovementSchema.index({
  createdAt: -1
});

module.exports = mongoose.model(
  'InventoryMovement',
  inventoryMovementSchema
);