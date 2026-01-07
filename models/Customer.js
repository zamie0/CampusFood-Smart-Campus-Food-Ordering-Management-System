const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema(
  {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'US' },
  },
  { _id: false }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String },
    address: AddressSchema,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

CustomerSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
