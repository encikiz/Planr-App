/**
 * Script to clean up guest users
 * 
 * This script:
 * 1. Keeps one guest user (the oldest one) and renames it to the shared guest account
 * 2. Removes all other guest users from the database
 * 
 * Run this script with: node scripts/cleanup-guest-users.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import User model
const User = require('../models/User');

async function cleanupGuestUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all guest users
    const guestUsers = await User.find({ isGuest: true }).sort({ createdAt: 1 });
    console.log(`Found ${guestUsers.length} guest users`);

    if (guestUsers.length === 0) {
      console.log('No guest users found. Creating a shared guest account...');
      
      // Create a shared guest account
      await User.create({
        name: 'Guest User',
        email: 'shared-guest@planr.app',
        isGuest: true,
        role: 'Guest',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=808080&color=fff'
      });
      
      console.log('Shared guest account created');
    } else {
      // Keep the oldest guest user and update it
      const oldestGuest = guestUsers[0];
      console.log(`Keeping oldest guest user (${oldestGuest._id}) and updating it to shared account`);
      
      await User.findByIdAndUpdate(oldestGuest._id, {
        name: 'Guest User',
        email: 'shared-guest@planr.app',
        role: 'Guest',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=808080&color=fff'
      });
      
      // Delete all other guest users
      if (guestUsers.length > 1) {
        const otherGuestIds = guestUsers.slice(1).map(user => user._id);
        console.log(`Deleting ${otherGuestIds.length} other guest users...`);
        
        await User.deleteMany({ _id: { $in: otherGuestIds } });
        console.log('Other guest users deleted successfully');
      }
    }

    console.log('Guest user cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning up guest users:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the cleanup function
cleanupGuestUsers();
