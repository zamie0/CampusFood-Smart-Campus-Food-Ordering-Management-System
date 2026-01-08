import mongoose from 'mongoose';

// --- Sub-schemas ---
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
    day: { type: String }, 
    open: { type: String }, 
    close: { type: String }, 
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
    status: { type: String, enum: ['active', 'pending', 'archived'], default: 'active' },
  },
  { _id: false, timestamps: false }
);

// --- Main Vendor schema ---
const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true }, 
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

// --- Text index for search ---
VendorSchema.index({ name: 'text', email: 'text' });

// --- Export model (reuse if already exists) ---
const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

export default Vendor;