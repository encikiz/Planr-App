const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', ensureAuth, async (req, res) => {
  try {
    const users = await User.find().select('-googleId -createdAt');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/current
// @desc    Get current user
// @access  Private
router.get('/current', ensureAuth, (req, res) => {
  res.json(req.user);
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-googleId -createdAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Create a new team member
// @access  Private
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { name, email, role, department } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Create new user object
    const newUser = {
      name,
      role: role || 'Team Member', // Default role if not provided
      createdBy: req.user._id
    };

    // Add optional fields if provided
    if (email) newUser.email = email;
    if (department) newUser.department = department;

    // Generate avatar from name if not provided
    newUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

    // Create the user
    const user = await User.create(newUser);

    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating team member:', err);

    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id/projects
// @desc    Get projects for a specific user
// @access  Private
router.get('/:id/projects', ensureAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all projects where this user is in the teamMembers array
    const projects = await Project.find({ teamMembers: userId })
      .populate('teamMembers', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    res.json(projects);
  } catch (err) {
    console.error('Error fetching user projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id/tasks
// @desc    Get tasks assigned to a specific user
// @access  Private
router.get('/:id/tasks', ensureAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all tasks where this user is in the assignedTo array
    const tasks = await Task.find({ assignedTo: userId })
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching user tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is trying to delete themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    // Remove user from tasks
    await Task.updateMany(
      { assignedTo: req.params.id },
      { $pull: { assignedTo: req.params.id } }
    );

    // Remove user from projects
    await Project.updateMany(
      { teamMembers: req.params.id },
      { $pull: { teamMembers: req.params.id } }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id/performance
// @desc    Get performance data for a specific user
// @access  Private
router.get('/:id/performance', async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all tasks assigned to this user
    const tasks = await Task.find({ assignedTo: userId });

    // Get all projects this user is part of
    const projects = await Project.find({ teamMembers: userId });

    // Calculate performance metrics
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));

    // Group tasks by week (last 4 weeks)
    const weeklyData = [
      { label: 'Week 1', tasksCompleted: 0, hoursWorked: 0 },
      { label: 'Week 2', tasksCompleted: 0, hoursWorked: 0 },
      { label: 'Week 3', tasksCompleted: 0, hoursWorked: 0 },
      { label: 'Week 4', tasksCompleted: 0, hoursWorked: 0 }
    ];

    // Process tasks to calculate weekly metrics
    tasks.forEach(task => {
      // Only consider tasks updated in the last 4 weeks
      if (task.updatedAt && task.updatedAt > fourWeeksAgo) {
        // Calculate which week this task belongs to (0-3)
        const taskDate = new Date(task.updatedAt);
        const weekIndex = 3 - Math.floor((now - taskDate) / (7 * 24 * 60 * 60 * 1000));

        if (weekIndex >= 0 && weekIndex < 4) {
          // If task was completed, increment the completed count
          if (task.status === 'completed') {
            weeklyData[weekIndex].tasksCompleted++;
          }

          // Estimate hours worked based on task complexity or priority
          // Here we're using a simple estimation based on priority
          let hoursEstimate = 2; // Default
          if (task.priority === 'high') hoursEstimate = 5;
          else if (task.priority === 'medium') hoursEstimate = 3;

          weeklyData[weekIndex].hoursWorked += hoursEstimate;
        }
      }
    });

    // Calculate overall metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const notStartedTasks = tasks.filter(task => task.status === 'not-started').length;

    // Calculate on-time completion rate
    const tasksWithDueDate = tasks.filter(task => task.dueDate);
    const onTimeCompletions = tasksWithDueDate.filter(task => {
      if (task.status !== 'completed') return false;
      const dueDate = new Date(task.dueDate);
      const completedDate = task.updatedAt || now;
      return completedDate <= dueDate;
    }).length;

    const onTimeRate = tasksWithDueDate.length > 0
      ? Math.round((onTimeCompletions / tasksWithDueDate.length) * 100)
      : 0;

    // Calculate project contribution
    const projectContributions = projects.map(project => ({
      name: project.name,
      contribution: Math.round(Math.random() * 100) // In a real app, this would be calculated based on actual contributions
    }));

    // Return the performance data
    res.json({
      weeklyData,
      taskMetrics: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        notStarted: notStartedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        onTimeCompletionRate: onTimeRate
      },
      projectContributions: projectContributions.slice(0, 5) // Limit to top 5 projects
    });
  } catch (err) {
    console.error('Error fetching user performance data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
