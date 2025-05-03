/**
 * Script to create sample projects and tasks for development and testing
 * 
 * This script creates sample projects and tasks that can be used
 * for testing the application.
 * 
 * Run this script with: node scripts/create-sample-data.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Import models
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // Find test user
    const testUser = await User.findOne({ email: 'test@planr.app' });
    
    if (!testUser) {
      console.error('Test user not found. Please run create-test-user.js first.');
      process.exit(1);
    }
    
    // Get team members
    const teamMembers = await User.find({ 
      createdBy: testUser._id,
      email: { $ne: testUser.email }
    });
    
    if (teamMembers.length === 0) {
      console.error('No team members found. Please run create-test-user.js first.');
      process.exit(1);
    }
    
    // Create sample projects
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Redesign the company website with modern UI/UX principles',
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-04-30'),
        status: 'in-progress',
        priority: 'high',
        progress: 65,
        team: teamMembers.map(member => member._id),
        createdBy: testUser._id
      },
      {
        name: 'Mobile App Development',
        description: 'Develop a new mobile app for iOS and Android platforms',
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-06-30'),
        status: 'in-progress',
        priority: 'high',
        progress: 40,
        team: [teamMembers[0]._id, teamMembers[2]._id],
        createdBy: testUser._id
      },
      {
        name: 'Marketing Campaign',
        description: 'Plan and execute Q2 marketing campaign',
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-05-31'),
        status: 'not-started',
        priority: 'medium',
        progress: 10,
        team: [teamMembers[1]._id],
        createdBy: testUser._id
      },
      {
        name: 'Database Migration',
        description: 'Migrate legacy database to new cloud platform',
        startDate: new Date('2023-01-10'),
        endDate: new Date('2023-03-15'),
        status: 'completed',
        priority: 'high',
        progress: 100,
        team: [teamMembers[0]._id],
        createdBy: testUser._id
      }
    ];
    
    const createdProjects = [];
    
    for (const project of projects) {
      // Check if project already exists
      const existingProject = await Project.findOne({ 
        name: project.name,
        createdBy: testUser._id
      });
      
      if (!existingProject) {
        const newProject = await Project.create(project);
        console.log(`Project created: ${newProject.name}`);
        createdProjects.push(newProject);
      } else {
        console.log(`Project already exists: ${existingProject.name}`);
        createdProjects.push(existingProject);
      }
    }
    
    // Create sample tasks
    const tasks = [
      // Website Redesign tasks
      {
        name: 'Design Homepage Mockup',
        description: 'Create mockup designs for the new homepage',
        startDate: new Date('2023-01-20'),
        dueDate: new Date('2023-02-05'),
        status: 'completed',
        priority: 'high',
        projectId: createdProjects[0]._id,
        assignedTo: [teamMembers[1]._id], // Sarah (Designer)
        createdBy: testUser._id
      },
      {
        name: 'Implement Homepage Frontend',
        description: 'Develop frontend code for the new homepage design',
        startDate: new Date('2023-02-10'),
        dueDate: new Date('2023-03-01'),
        status: 'completed',
        priority: 'high',
        projectId: createdProjects[0]._id,
        assignedTo: [teamMembers[2]._id], // Michael (Frontend)
        createdBy: testUser._id
      },
      {
        name: 'Setup API Endpoints',
        description: 'Create backend API endpoints for the website',
        startDate: new Date('2023-02-15'),
        dueDate: new Date('2023-03-15'),
        status: 'completed',
        priority: 'medium',
        projectId: createdProjects[0]._id,
        assignedTo: [teamMembers[0]._id], // Alex (Backend)
        createdBy: testUser._id
      },
      {
        name: 'Implement User Authentication',
        description: 'Add user login and registration functionality',
        startDate: new Date('2023-03-10'),
        dueDate: new Date('2023-04-01'),
        status: 'in-progress',
        priority: 'high',
        projectId: createdProjects[0]._id,
        assignedTo: [teamMembers[0]._id], // Alex (Backend)
        createdBy: testUser._id
      },
      {
        name: 'Design About Page',
        description: 'Create design for the about page',
        startDate: new Date('2023-03-15'),
        dueDate: new Date('2023-03-30'),
        status: 'in-progress',
        priority: 'medium',
        projectId: createdProjects[0]._id,
        assignedTo: [teamMembers[1]._id], // Sarah (Designer)
        createdBy: testUser._id
      },
      
      // Mobile App Development tasks
      {
        name: 'Create App Wireframes',
        description: 'Design initial wireframes for the mobile app',
        startDate: new Date('2023-02-05'),
        dueDate: new Date('2023-02-20'),
        status: 'completed',
        priority: 'high',
        projectId: createdProjects[1]._id,
        assignedTo: [teamMembers[1]._id], // Sarah (Designer)
        createdBy: testUser._id
      },
      {
        name: 'Develop User Interface',
        description: 'Implement the UI components for the app',
        startDate: new Date('2023-02-25'),
        dueDate: new Date('2023-03-25'),
        status: 'in-progress',
        priority: 'high',
        projectId: createdProjects[1]._id,
        assignedTo: [teamMembers[2]._id], // Michael (Frontend)
        createdBy: testUser._id
      },
      {
        name: 'Setup Backend Services',
        description: 'Create backend services for the mobile app',
        startDate: new Date('2023-03-01'),
        dueDate: new Date('2023-04-15'),
        status: 'in-progress',
        priority: 'medium',
        projectId: createdProjects[1]._id,
        assignedTo: [teamMembers[0]._id], // Alex (Backend)
        createdBy: testUser._id
      },
      
      // Marketing Campaign tasks
      {
        name: 'Create Campaign Strategy',
        description: 'Develop overall strategy for the marketing campaign',
        startDate: new Date('2023-03-05'),
        dueDate: new Date('2023-03-20'),
        status: 'in-progress',
        priority: 'high',
        projectId: createdProjects[2]._id,
        assignedTo: [teamMembers[1]._id], // Sarah (Designer)
        createdBy: testUser._id
      },
      
      // Database Migration tasks
      {
        name: 'Backup Existing Database',
        description: 'Create full backup of the existing database',
        startDate: new Date('2023-01-12'),
        dueDate: new Date('2023-01-15'),
        status: 'completed',
        priority: 'high',
        projectId: createdProjects[3]._id,
        assignedTo: [teamMembers[0]._id], // Alex (Backend)
        createdBy: testUser._id
      },
      {
        name: 'Setup New Database Schema',
        description: 'Create schema for the new database',
        startDate: new Date('2023-01-18'),
        dueDate: new Date('2023-02-01'),
        status: 'completed',
        priority: 'high',
        projectId: createdProjects[3]._id,
        assignedTo: [teamMembers[0]._id], // Alex (Backend)
        createdBy: testUser._id
      },
      {
        name: 'Migrate Data',
        description: 'Transfer data from old database to new one',
        startDate: new Date('2023-02-05'),
        dueDate: new Date('2023-02-28'),
        status: 'completed',
        priority: 'high',
        projectId: createdProjects[3]._id,
        assignedTo: [teamMembers[0]._id], // Alex (Backend)
        createdBy: testUser._id
      }
    ];
    
    for (const task of tasks) {
      // Check if task already exists
      const existingTask = await Task.findOne({ 
        name: task.name,
        projectId: task.projectId
      });
      
      if (!existingTask) {
        const newTask = await Task.create(task);
        console.log(`Task created: ${newTask.name}`);
      } else {
        console.log(`Task already exists: ${existingTask.name}`);
      }
    }
    
    console.log('Sample data creation completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
}

// Run the function
createSampleData();
