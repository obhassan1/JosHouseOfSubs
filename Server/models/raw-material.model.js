const mongoose = require('mongoose');

const rawMaterialSchema =
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    quantity: {
      type: Number,
      required: true,
      min: 0
    },

    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryCategory',
      default: null,
      index: true
    },

    minimumQuantity: {
      type: Number,
      default: 0,
      min: 0
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

rawMaterialSchema.index(
  {
    name: 1,
    unit: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  'RawMaterial',
  rawMaterialSchema
);