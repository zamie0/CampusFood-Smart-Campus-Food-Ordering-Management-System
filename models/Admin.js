const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true }, // Hashed password
    role: { type: String, enum: ['superadmin', 'admin', 'staff'], default: 'admin' },
    permissions: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

AdminSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
