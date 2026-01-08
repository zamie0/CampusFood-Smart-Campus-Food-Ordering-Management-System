import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    foodItemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: false,
      default: undefined,
      sparse: true
    },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    specialInstructions: { type: String },
  },
  { _id: false, strict: true }
);

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: { type: String },
    deliveryAddress: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: 'US' },
    },
    estimatedReadyTime: { type: Date },
    actualReadyTime: { type: Date },
    deliveredTime: { type: Date },
    notes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Indexes for efficient queries
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ vendorId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// In development, delete cached model to ensure schema changes take effect
// This is important because Next.js caches modules and Mongoose caches models
if (process.env.NODE_ENV === 'development' && mongoose.models.Order) {
  delete mongoose.models.Order;
  if (mongoose.modelSchemas && mongoose.modelSchemas.Order) {
    delete mongoose.modelSchemas.Order;
  }
}

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;