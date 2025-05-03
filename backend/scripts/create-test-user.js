/**
 * Script to create a test user for development and testing
 * 
 * This script creates a test user with admin privileges that can be used
 * for testing the application without OAuth.
 * 
 * Run this script with: node scripts/create-test-user.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Import User model
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@planr.app' });
    
    if (existingUser) {
      console.log('Test user already exists with ID:', existingUser._id);
      process.exit(0);
    }
    
    // Create test user
    const testUser = {
      name: 'Test User',
      email: 'test@planr.app',
      role: 'Admin',
      avatar: 'https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff',
      isGuest: false
    };
    
    const user = await User.create(testUser);
    console.log('Test user created successfully with ID:', user._id);
    
    // Create some sample team members
    const teamMembers = [
      {
        name: 'Alex Johnson',
        email: 'alex@planr.app',
        role: 'Backend Developer',
        department: 'Engineering',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=random&color=fff',
        createdBy: user._id
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@planr.app',
        role: 'UI/UX Designer',
        department: 'Design',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random&color=fff',
        createdBy: user._id
      },
      {
        name: 'Michael Rodriguez',
        email: 'michael@planr.app',
        role: 'Frontend Developer',
        department: 'Engineering',
        avatar: 'https://ui-avatars.com/api/?name=Michael+Rodriguez&background=random&color=fff',
        createdBy: user._id
      }
    ];
    
    for (const member of teamMembers) {
      const existingMember = await User.findOne({ email: member.email });
      if (!existingMember) {
        const newMember = await User.create(member);
        console.log(`Team member created: ${newMember.name}`);
      } else {
        console.log(`Team member already exists: ${existingMember.name}`);
      }
    }
    
    console.log('Test data creation completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

// Run the function
createTestUser();
