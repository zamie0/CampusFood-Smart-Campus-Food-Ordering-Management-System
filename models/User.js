import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        _id: {type: String, required: true},
        name: {type: String, required: true},
        email: {type: String, required: true},
        image: {type: String, required: false},
        uniqueUsername: {type: String, required: false, unique: true, sparse: true}
    },
    {timestamps: true}
);

const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User;

