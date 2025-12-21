import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(userId);
    
    if (!user) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      data: { 
        uniqueUsername: user.uniqueUsername || '',
        email: user.email,
        name: user.name 
      } 
    });

  } catch (error) {
    console.error("Error fetching user data:", error);
    return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { uniqueUsername } = await req.json();
    
    if (!uniqueUsername || !uniqueUsername.startsWith('@')) {
      return Response.json({ success: false, message: "Invalid username format" }, { status: 400 });
    }

    // Check if username contains spaces
    if (uniqueUsername.includes(' ')) {
      return Response.json({ success: false, message: "Username cannot contain spaces" }, { status: 400 });
    }

    // Check minimum length (4 characters excluding @)
    if (uniqueUsername.length < 5) { // @ + 4 characters = 5 total
      return Response.json({ success: false, message: "Username must be at least 4 characters (excluding @)" }, { status: 400 });
    }

    // Check if username exceeds 15 characters total
    if (uniqueUsername.length > 15) {
      return Response.json({ success: false, message: "Username cannot exceed 14 characters (excluding @)" }, { status: 400 });
    }

    // Check if username is already taken by another user
    await connectDB();
    const existingUser = await User.findOne({ 
      uniqueUsername: uniqueUsername.toLowerCase(),
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      return Response.json({ success: false, message: "Username already taken" }, { status: 409 });
    }

    // Update user's unique username
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { uniqueUsername: uniqueUsername.toLowerCase() },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      message: "Username updated successfully",
      data: { uniqueUsername: updatedUser.uniqueUsername }
    });

  } catch (error) {
    console.error("Error updating username:", error);
    return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
