import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    food_item_id: { type: String, required: true },
    vendor_id: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per user-item-vendor combination
FavoriteSchema.index({ user_id: 1, food_item_id: 1, vendor_id: 1 }, { unique: true });

const Favorite = mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

export default Favorite;