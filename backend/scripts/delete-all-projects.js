/**
 * Script to delete all projects and related data
 * 
 * This script removes all projects, tasks, and milestones from the database
 * to provide a clean slate for testing.
 * 
 * Run this script with: node scripts/delete-all-projects.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Import models
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

async function deleteAllProjects() {
  try {
    console.log('Starting deletion of all projects and related data...');
    
    // Delete all tasks
    const tasksResult = await Task.deleteMany({});
    console.log(`Deleted ${tasksResult.deletedCount} tasks`);
    
    // Delete all milestones
    const milestonesResult = await Milestone.deleteMany({});
    console.log(`Deleted ${milestonesResult.deletedCount} milestones`);
    
    // Delete all projects
    const projectsResult = await Project.deleteMany({});
    console.log(`Deleted ${projectsResult.deletedCount} projects`);
    
    console.log('All projects and related data have been deleted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during deletion:', error);
    process.exit(1);
  }
}

// Confirm before proceeding
console.log('WARNING: This will delete ALL projects, tasks, and milestones from the database.');
console.log('This action cannot be undone.');
console.log('Press Ctrl+C to cancel or wait 5 seconds to proceed...');

// Wait 5 seconds before proceeding
setTimeout(() => {
  console.log('Proceeding with deletion...');
  deleteAllProjects();
}, 5000);
