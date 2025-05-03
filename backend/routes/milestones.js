const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');

// @route   GET /api/milestones/debug
// @desc    Debug route to check milestones collection
// @access  Public (for debugging only)
router.get('/debug', async (req, res) => {
  try {
    console.log('Debug route accessed for milestones');
    const count = await Milestone.countDocuments();
    const milestones = await Milestone.find().limit(5)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email avatar');

    // Check if the milestone with ID from the request exists
    const milestoneId = req.query.id;
    let specificMilestone = null;
    if (milestoneId) {
      specificMilestone = await Milestone.findById(milestoneId)
        .populate('projectId', 'name')
        .populate('createdBy', 'name email avatar');
    }

    // Get all milestone IDs
    const allIds = await Milestone.find().select('_id');

    res.json({
      count,
      message: count > 0 ? 'Milestones found' : 'No milestones in database',
      sample: milestones,
      specificMilestone: specificMilestone,
      allIds: allIds.map(m => m._id)
    });
  } catch (err) {
    console.error('Error in debug route:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// @route   GET /api/milestones/direct
// @desc    Direct route to get all milestones (no auth required for debugging)
// @access  Public (for debugging only)
router.get('/direct', async (req, res) => {
  try {
    console.log('Direct route accessed for milestones');
    const milestones = await Milestone.find()
      .populate('projectId', 'name')
      .populate('createdBy', 'name email avatar');

    console.log('Milestones found:', milestones.length);

    res.json(milestones);
  } catch (err) {
    console.error('Error in direct route:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// @route   GET /api/milestones/test
// @desc    Test route to create a milestone
// @access  Public (for debugging only)
router.get('/test', async (req, res) => {
  try {
    console.log('Test route accessed for milestones');

    // Get a project to associate with the milestone
    const projects = await Project.find().limit(1);

    if (projects.length === 0) {
      return res.status(404).json({ error: 'No projects found' });
    }

    const projectId = projects[0]._id;

    // Create a test milestone
    const newMilestone = new Milestone({
      projectId,
      name: 'Test Milestone ' + Date.now(),
      description: 'This is a test milestone created via the test endpoint',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      status: 'in-progress',
      progress: 50,
      deliverables: ['Test deliverable 1', 'Test deliverable 2'],
      createdBy: req.query.userId || '68027c39a96023160d3b83f7' // Default to a known user ID
    });

    const savedMilestone = await newMilestone.save();

    res.json({
      message: 'Test milestone created successfully',
      milestone: savedMilestone
    });
  } catch (err) {
    console.error('Error in test route:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// @route   GET /api/milestones
// @desc    Get all milestones
// @access  Private
router.get('/', ensureAuth, async (req, res) => {
  try {
    console.log('GET /api/milestones route accessed');
    console.log('User:', req.user);

    // Create a test milestone if none exist
    const count = await Milestone.countDocuments();
    console.log('Current milestone count:', count);

    if (count === 0 && req.user) {
      console.log('Creating a test milestone');

      // Get a project to associate with the milestone
      const projects = await Project.find().limit(1);

      if (projects.length > 0) {
        const projectId = projects[0]._id;
        console.log('Using project:', projects[0].name);

        // Create test milestone
        const newMilestone = new Milestone({
          projectId,
          name: 'Project Launch',
          description: 'Official launch of the project with all core features implemented',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          status: 'in-progress',
          progress: 65,
          deliverables: ['Final documentation', 'User training materials', 'Production deployment'],
          createdBy: req.user._id
        });

        await newMilestone.save();
        console.log('First test milestone created successfully');

        // Create a second test milestone
        const secondMilestone = new Milestone({
          projectId,
          name: 'Beta Testing Phase',
          description: 'Conduct beta testing with selected users to gather feedback',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          status: 'not-started',
          progress: 0,
          deliverables: ['Test plan', 'Feedback collection form', 'Bug tracking system setup'],
          createdBy: req.user._id
        });

        await secondMilestone.save();
        console.log('Second test milestone created successfully');

        // Create a third test milestone (completed)
        const thirdMilestone = new Milestone({
          projectId,
          name: 'Requirements Gathering',
          description: 'Collect and document all project requirements from stakeholders',
          dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
          status: 'completed',
          progress: 100,
          deliverables: ['Requirements document', 'Stakeholder sign-off', 'Initial project plan'],
          createdBy: req.user._id
        });

        await thirdMilestone.save();
        console.log('Third test milestone created successfully');
      } else {
        console.log('No projects found to associate with test milestone');

        // Create a project first
        const newProject = new Project({
          name: 'Sample Project',
          description: 'A sample project created automatically',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'active',
          createdBy: req.user._id
        });

        const savedProject = await newProject.save();
        console.log('Sample project created successfully');

        // Now create a milestone with this project
        const newMilestone = new Milestone({
          projectId: savedProject._id,
          name: 'Project Launch',
          description: 'Official launch of the project with all core features implemented',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          status: 'in-progress',
          progress: 65,
          deliverables: ['Final documentation', 'User training materials', 'Production deployment'],
          createdBy: req.user._id
        });

        await newMilestone.save();
        console.log('Test milestone created successfully with new project');
      }
    }

    const milestones = await Milestone.find()
      .populate('projectId', 'name')
      .populate('createdBy', 'name email avatar');

    console.log('Milestones found:', milestones.length);

    res.json(milestones);
  } catch (err) {
    console.error('Error fetching milestones:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/milestones/:id
// @desc    Get milestone by ID
// @access  Private
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('createdBy', 'name email avatar');

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(milestone);
  } catch (err) {
    console.error('Error fetching milestone:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/milestones
// @desc    Create a new milestone
// @access  Private
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { projectId, name, description, dueDate, status, deliverables } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create new milestone
    const newMilestone = new Milestone({
      projectId,
      name,
      description,
      dueDate,
      status: status || 'not-started',
      progress: status === 'completed' ? 100 : 0,
      deliverables: deliverables || [],
      createdBy: req.user.id
    });

    const milestone = await newMilestone.save();

    res.status(201).json(milestone);
  } catch (err) {
    console.error('Error creating milestone:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/milestones/:id
// @desc    Update a milestone
// @access  Private
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const { name, description, dueDate, status, progress, deliverables } = req.body;

    // Find milestone
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Update milestone fields
    milestone.name = name || milestone.name;
    milestone.description = description || milestone.description;
    milestone.dueDate = dueDate || milestone.dueDate;
    milestone.status = status || milestone.status;
    milestone.progress = progress !== undefined ? progress : milestone.progress;

    // If status is completed, set progress to 100%
    if (status === 'completed' && milestone.status !== 'completed') {
      milestone.progress = 100;
    }

    milestone.deliverables = deliverables || milestone.deliverables;
    milestone.updatedAt = Date.now();

    // Save updated milestone
    milestone = await milestone.save();

    res.json(milestone);
  } catch (err) {
    console.error('Error updating milestone:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/milestones/:id
// @desc    Delete a milestone
// @access  Private
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    // Find milestone
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Delete the milestone using findByIdAndDelete instead of remove()
    await Milestone.findByIdAndDelete(req.params.id);

    res.json({ message: 'Milestone deleted successfully' });
  } catch (err) {
    console.error('Error deleting milestone:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
