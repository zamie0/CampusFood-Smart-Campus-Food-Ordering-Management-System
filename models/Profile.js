import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String },
    email: { type: String },
    avatarUrl: { type: String },
    notificationsEnabled: { type: Boolean, default: true },
    promoNotifications: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);

export default Profile;
