import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from "@/config/db";
import User from '@/models/User';

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || username.length < 2) {
      return NextResponse.json({ success: false, message: 'Username must be at least 2 characters' }, { status: 400 });
    }

    await connectDB();

    // Search for users by uniqueUsername (case-insensitive)
    const users = await User.find({
      uniqueUsername: { $regex: username, $options: 'i' },
      _id: { $ne: userId } // Exclude current user
    })
    .select('uniqueUsername _id name email image')
    .limit(20)
    .sort({ uniqueUsername: 1 });

    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.uniqueUsername,
      name: user.name,
      email: user.email,
      image: user.image, // Include the user's profile picture from Clerk
      lastSeen: null // We don't have lastSeen field in User model yet
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
