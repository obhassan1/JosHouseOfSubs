const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "Jo's House of Subs" },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  hours: { type: [String], default: [] },
  socialLinks: { type: Map, of: String, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
