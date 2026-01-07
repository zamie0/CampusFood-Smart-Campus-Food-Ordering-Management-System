const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema(
  {
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const HoursSchema = new mongoose.Schema(
  {
    day: { type: String }, // e.g., Mon, Tue
    open: { type: String }, // e.g., 09:00
    close: { type: String }, // e.g., 17:00
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const FoodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    tags: [{ type: String }],
    image: { type: String },
    // status can be used if you want one list with different states
    status: { type: String, enum: ['active', 'pending', 'archived'], default: 'active' },
  },
  { _id: false, timestamps: false }
);

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true }, // Hashed password
    phone: { type: String },
    categories: [{ type: String }],
    details: { type: String },
    isOnline: { type: Boolean, default: false },
    menu: [FoodItemSchema],
    pendingMenu: [FoodItemSchema],
    location: LocationSchema,
    hours: [HoursSchema],
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

VendorSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
