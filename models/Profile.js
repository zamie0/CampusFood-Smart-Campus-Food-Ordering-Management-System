import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    full_name: { type: String },
    email: { type: String },
    avatar_url: { type: String },
    student_id: { type: String, sparse: true, index: true },
    student_id_verified: {
      type: String,
      enum: ["pending", "verified", "declined"],
      default: null
    },
    notifications_enabled: { type: Boolean, default: true },
    promo_notifications: { type: Boolean, default: true },
    order_notifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);

export default Profile;