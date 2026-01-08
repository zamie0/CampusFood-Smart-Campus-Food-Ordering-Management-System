import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk user ID
    email: { type: String, required: true, lowercase: true, index: true },
    name: { type: String },
    image: { type: String },
    uniqueUsername: { type: String, unique: true, sparse: true, lowercase: true, index: true },
  },
  { timestamps: true, _id: false } // Disable auto _id since we're using Clerk ID
);

UserSchema.index({ name: 'text', email: 'text', uniqueUsername: 'text' });

// In development, delete cached model to ensure schema changes take effect
if (process.env.NODE_ENV === 'development' && mongoose.models.User) {
  delete mongoose.models.User;
  if (mongoose.modelSchemas && mongoose.modelSchemas.User) {
    delete mongoose.modelSchemas.User;
  }
}

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;

