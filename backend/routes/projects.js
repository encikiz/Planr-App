const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', ensureAuth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('teamMembers', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log('Attempting to fetch project with ID:', projectId);

    let project;

    // Try to find by MongoDB ObjectId first
    if (projectId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Trying to find project by MongoDB ObjectId');
      project = await Project.findById(projectId)
        .populate('teamMembers', 'name email avatar role')
        .populate('createdBy', 'name email avatar');
    }

    // If not found or not a valid ObjectId, try to find by numeric ID
    if (!project) {
      console.log('Trying to find project by legacy ID');
      // Try to parse the ID as a number, but handle potential NaN
      const numericId = parseInt(projectId);
      if (!isNaN(numericId)) {
        project = await Project.findOne({ legacyId: numericId })
          .populate('teamMembers', 'name email avatar role')
          .populate('createdBy', 'name email avatar');
      }
    }

    if (!project) {
      console.log('Project not found with ID:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Found project:', project.name, 'with ID:', project._id);
    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, priority, teamMembers, legacyId } = req.body;

    // Create new project
    const newProject = new Project({
      name,
      description,
      startDate,
      endDate,
      status: status || 'not-started',
      progress: 0,
      priority: priority || 'medium',
      teamMembers: teamMembers || [],
      createdBy: req.user.id,
      legacyId: legacyId || null // Store legacy ID if provided
    });

    const project = await newProject.save();

    res.status(201).json(project);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, progress, priority, teamMembers } = req.body;
    const projectId = req.params.id;
    let project;

    // Try to find by MongoDB ObjectId first
    if (projectId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(projectId);
    }

    // If not found or not a valid ObjectId, try to find by numeric ID
    if (!project) {
      project = await Project.findOne({ legacyId: parseInt(projectId) });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project fields
    project.name = name || project.name;
    project.description = description || project.description;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.status = status || project.status;
    project.progress = progress !== undefined ? progress : project.progress;
    project.priority = priority || project.priority;
    project.teamMembers = teamMembers || project.teamMembers;
    project.updatedAt = Date.now();

    // Save updated project
    project = await project.save();

    res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const projectId = req.params.id;
    console.log('Attempting to delete project with ID:', projectId);

    let project;

    // Try to find by MongoDB ObjectId first
    if (projectId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Trying to find project by MongoDB ObjectId');
      project = await Project.findById(projectId);
    }

    // If not found or not a valid ObjectId, try to find by numeric ID
    if (!project) {
      console.log('Trying to find project by legacy ID');
      // Try to parse the ID as a number, but handle potential NaN
      const numericId = parseInt(projectId);
      if (!isNaN(numericId)) {
        project = await Project.findOne({ legacyId: numericId });
      }
    }

    if (!project) {
      console.log('Project not found with ID:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Found project:', project.name, 'with ID:', project._id);

    // Get the MongoDB ObjectId of the project
    const mongoProjectId = project._id;

    // Delete all tasks associated with the project
    const deletedTasks = await Task.deleteMany({ projectId: mongoProjectId });
    console.log('Deleted tasks:', deletedTasks.deletedCount);

    // Delete all milestones associated with the project
    const deletedMilestones = await Milestone.deleteMany({ projectId: mongoProjectId });
    console.log('Deleted milestones:', deletedMilestones.deletedCount);

    // Delete the project using findByIdAndDelete
    const deletedProject = await Project.findByIdAndDelete(mongoProjectId);
    console.log('Project deleted:', deletedProject ? 'Yes' : 'No');

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// @route   GET /api/projects/:id/tasks
// @desc    Get all tasks for a project
// @access  Private
router.get('/:id/tasks', ensureAuth, async (req, res) => {
  try {
    const projectId = req.params.id;
    let project;

    // Try to find by MongoDB ObjectId first
    if (projectId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(projectId);
    }

    // If not found or not a valid ObjectId, try to find by numeric ID
    if (!project) {
      project = await Project.findOne({ legacyId: parseInt(projectId) });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Use the MongoDB ObjectId of the project
    const mongoProjectId = project._id;

    const tasks = await Task.find({ projectId: mongoProjectId })
      .populate('assignedTo', 'name email avatar role');

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching project tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/projects/:id/milestones
// @desc    Get all milestones for a project
// @access  Private
router.get('/:id/milestones', ensureAuth, async (req, res) => {
  try {
    const projectId = req.params.id;
    let project;

    // Try to find by MongoDB ObjectId first
    if (projectId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(projectId);
    }

    // If not found or not a valid ObjectId, try to find by numeric ID
    if (!project) {
      project = await Project.findOne({ legacyId: parseInt(projectId) });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Use the MongoDB ObjectId of the project
    const mongoProjectId = project._id;

    const milestones = await Milestone.find({ projectId: mongoProjectId });

    res.json(milestones);
  } catch (err) {
    console.error('Error fetching project milestones:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
