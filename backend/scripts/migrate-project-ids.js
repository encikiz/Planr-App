/**
 * Migration script to add legacyId field to existing projects
 * 
 * This script finds all projects in the database and adds a legacyId field
 * based on the numeric part of their MongoDB ObjectId.
 * 
 * Run this script with: node scripts/migrate-project-ids.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Import Project model
const Project = require('../models/Project');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

async function migrateProjectIds() {
  try {
    console.log('Starting project ID migration...');
    
    // Get all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to process`);
    
    let updatedCount = 0;
    
    // Process each project
    for (const project of projects) {
      // Skip projects that already have a legacyId
      if (project.legacyId) {
        console.log(`Project ${project._id} already has legacyId: ${project.legacyId}`);
        continue;
      }
      
      // Extract numeric part from ObjectId
      const idString = project._id.toString();
      const numericPart = idString.substring(0, 5); // Take first 5 characters
      const legacyId = parseInt(numericPart, 16); // Convert from hex to decimal
      
      // Update the project with the new legacyId
      project.legacyId = legacyId;
      await project.save();
      
      console.log(`Updated project ${project._id} with legacyId: ${legacyId}`);
      updatedCount++;
    }
    
    console.log(`Migration completed. Updated ${updatedCount} projects.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateProjectIds();
