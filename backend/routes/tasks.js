const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', ensureAuth, async (req, res) => {
  try {
    // Check if we need to filter by projectId or milestoneId
    const filter = {};

    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    if (req.query.milestoneId) {
      filter.milestoneId = req.query.milestoneId;
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('milestoneId', 'name status')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('milestoneId', 'name status dueDate progress')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { projectId, milestoneId, name, description, assignedTo, status, priority, startDate, dueDate } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if milestone exists if provided
    if (milestoneId) {
      const milestone = await Milestone.findById(milestoneId);
      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }
      // Verify milestone belongs to the specified project
      if (milestone.projectId.toString() !== projectId) {
        return res.status(400).json({ error: 'Milestone does not belong to the specified project' });
      }
    }

    // Create new task
    const newTask = new Task({
      projectId,
      milestoneId: milestoneId || null,
      name,
      description: description || '',
      assignedTo: assignedTo || [],
      status: status || 'not-started',
      progress: status === 'completed' ? 100 : 0,
      priority: priority || 'medium',
      startDate,
      dueDate,
      createdBy: req.user.id
    });

    const task = await newTask.save();

    // Update project progress
    await updateProjectProgress(projectId);

    // Update milestone progress if task is associated with a milestone
    if (milestoneId) {
      await updateMilestoneProgress(milestoneId);
    }

    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const { name, description, assignedTo, status, progress, priority, startDate, dueDate, projectId, milestoneId } = req.body;

    // Find task
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Store the old project ID for progress update
    const oldProjectId = task.projectId;
    const oldMilestoneId = task.milestoneId;

    // Check if project exists if projectId is provided
    if (projectId && projectId !== oldProjectId.toString()) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    // Check if milestone exists if provided
    if (milestoneId) {
      if (milestoneId === 'null' || milestoneId === '') {
        // Handle removing milestone association
        task.milestoneId = null;
      } else {
        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) {
          return res.status(404).json({ error: 'Milestone not found' });
        }

        // Verify milestone belongs to the correct project
        const projectToCheck = projectId || task.projectId.toString();
        if (milestone.projectId.toString() !== projectToCheck) {
          return res.status(400).json({ error: 'Milestone does not belong to the specified project' });
        }

        task.milestoneId = milestoneId;
      }
    }

    // Update task fields
    task.name = name || task.name;
    task.description = description !== undefined ? description : task.description;
    task.assignedTo = assignedTo || task.assignedTo;
    task.status = status || task.status;
    task.progress = progress !== undefined ? progress : task.progress;

    // Update project ID if provided
    if (projectId) {
      task.projectId = projectId;
    }

    // If status is completed, set progress to 100%
    if (status === 'completed' && task.status !== 'completed') {
      task.progress = 100;
    }

    task.priority = priority || task.priority;
    task.startDate = startDate || task.startDate;
    task.dueDate = dueDate || task.dueDate;
    task.updatedAt = Date.now();

    // Save updated task
    task = await task.save();

    // Update progress for both old and new projects if project was changed
    if (projectId && projectId !== oldProjectId.toString()) {
      await updateProjectProgress(oldProjectId);
      await updateProjectProgress(projectId);
    } else {
      // Update project progress for the current project
      await updateProjectProgress(task.projectId);
    }

    // Update milestone progress if milestone was changed or task was updated
    if (milestoneId && milestoneId !== 'null' && milestoneId !== '' &&
        (!oldMilestoneId || milestoneId !== oldMilestoneId.toString())) {
      // New milestone assigned
      await updateMilestoneProgress(milestoneId);
    } else if (oldMilestoneId) {
      // Update existing milestone
      await updateMilestoneProgress(oldMilestoneId);
    }

    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/tasks/clear-all
// @desc    Delete all tasks (for testing purposes)
// @access  Private
router.delete('/clear-all', ensureAuth, async (req, res) => {
  try {
    // Delete all tasks
    await Task.deleteMany({});

    // Update all projects' progress
    const projects = await Project.find();
    for (const project of projects) {
      await Project.findByIdAndUpdate(project._id, { progress: 0 });
    }

    res.json({ message: 'All tasks deleted successfully' });
  } catch (err) {
    console.error('Error deleting all tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    // Find task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const projectId = task.projectId;
    const milestoneId = task.milestoneId;

    // Delete the task using findByIdAndDelete instead of remove()
    await Task.findByIdAndDelete(req.params.id);

    // Update project progress
    await updateProjectProgress(projectId);

    // Update milestone progress if task was associated with a milestone
    if (milestoneId) {
      await updateMilestoneProgress(milestoneId);
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to update project progress based on tasks
async function updateProjectProgress(projectId) {
  try {
    // Get all tasks for the project
    const tasks = await Task.find({ projectId });

    if (tasks.length === 0) {
      // No tasks, set progress to 0
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return;
    }

    // Calculate average progress
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    const averageProgress = Math.round(totalProgress / tasks.length);

    // Update project progress
    await Project.findByIdAndUpdate(projectId, { progress: averageProgress });

    // Check if all tasks are completed
    const allCompleted = tasks.every(task => task.status === 'completed');

    if (allCompleted) {
      // If all tasks are completed, mark project as completed
      await Project.findByIdAndUpdate(projectId, { status: 'completed', progress: 100 });
    } else if (tasks.some(task => task.status === 'in-progress')) {
      // If any task is in progress, mark project as in progress
      await Project.findByIdAndUpdate(projectId, { status: 'in-progress' });
    }
  } catch (err) {
    console.error('Error updating project progress:', err);
  }
}

// @route   GET /api/tasks/milestone/:milestoneId
// @desc    Get tasks by milestone ID
// @access  Private
router.get('/milestone/:milestoneId', ensureAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ milestoneId: req.params.milestoneId })
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks by milestone:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to update milestone progress
async function updateMilestoneProgress(milestoneId) {
  try {
    if (!milestoneId) return;

    // Get all tasks for the milestone
    const tasks = await Task.find({ milestoneId });

    if (tasks.length === 0) {
      // No tasks, don't update progress
      return;
    }

    // Calculate average progress
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    const averageProgress = Math.round(totalProgress / tasks.length);

    // Update milestone progress
    await Milestone.findByIdAndUpdate(milestoneId, {
      progress: averageProgress,
      status: averageProgress === 100 ? 'completed' : averageProgress > 0 ? 'in-progress' : 'not-started'
    });
  } catch (err) {
    console.error('Error updating milestone progress:', err);
  }
}

module.exports = router;
