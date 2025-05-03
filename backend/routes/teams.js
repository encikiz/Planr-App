const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Team = require('../models/Team');
const User = require('../models/User');
const Project = require('../models/Project');

// @route   GET /api/teams
// @desc    Get all teams
// @access  Private
router.get('/', ensureAuth, async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('teamLeader', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate('projects', 'name description status progress')
      .populate('createdBy', 'name email avatar');

    res.json(teams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Private
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('teamLeader', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate('projects', 'name description status progress')
      .populate('createdBy', 'name email avatar');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { name, description, department, teamLeader, members, projects } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Create new team
    const newTeam = new Team({
      name,
      description: description || `Team created by ${req.user.name}`,
      department,
      teamLeader,
      members: members || [],
      projects: projects || [],
      createdBy: req.user._id
    });

    const team = await newTeam.save();

    // Populate references for the response
    const populatedTeam = await Team.findById(team._id)
      .populate('teamLeader', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate('projects', 'name description status progress')
      .populate('createdBy', 'name email avatar');

    res.status(201).json(populatedTeam);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/teams/:id
// @desc    Update a team
// @access  Private
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const { name, description, department, teamLeader, members, projects } = req.body;

    // Find team
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Update fields
    if (name) team.name = name;
    if (description) team.description = description;
    if (department) team.department = department;
    if (teamLeader) team.teamLeader = teamLeader;
    if (members) team.members = members;
    if (projects) team.projects = projects;

    team.updatedAt = Date.now();

    // Save updated team
    await team.save();

    // Populate references for the response
    const updatedTeam = await Team.findById(team._id)
      .populate('teamLeader', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate('projects', 'name description status progress')
      .populate('createdBy', 'name email avatar');

    res.json(updatedTeam);
  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/teams/:id
// @desc    Delete a team
// @access  Private
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    // Find team
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Delete the team
    await Team.findByIdAndDelete(req.params.id);

    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/teams/:id/members
// @desc    Add a member to a team
// @access  Private
router.post('/:id/members', ensureAuth, async (req, res) => {
  try {
    const { userId, role } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find team
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMember = team.members.find(member => 
      member.user.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }

    // Add member to team
    team.members.push({
      user: userId,
      role: role || 'Team Member',
      joinedAt: Date.now()
    });

    team.updatedAt = Date.now();

    // Save updated team
    await team.save();

    // Populate references for the response
    const updatedTeam = await Team.findById(team._id)
      .populate('teamLeader', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate('projects', 'name description status progress')
      .populate('createdBy', 'name email avatar');

    res.json(updatedTeam);
  } catch (err) {
    console.error('Error adding team member:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/teams/:id/members/:userId
// @desc    Remove a member from a team
// @access  Private
router.delete('/:id/members/:userId', ensureAuth, async (req, res) => {
  try {
    // Find team
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Remove member from team
    team.members = team.members.filter(member => 
      member.user.toString() !== req.params.userId
    );

    team.updatedAt = Date.now();

    // Save updated team
    await team.save();

    // Populate references for the response
    const updatedTeam = await Team.findById(team._id)
      .populate('teamLeader', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate('projects', 'name description status progress')
      .populate('createdBy', 'name email avatar');

    res.json(updatedTeam);
  } catch (err) {
    console.error('Error removing team member:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/teams/:id/projects
// @desc    Add a project to a team
// @access  Private
router.post('/:id/projects', ensureAuth, async (req, res) => {
  try {
    const { projectId } = req.body;

    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Find team
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if project is already assigned to the team
    if (team.projects.includes(projectId)) {
      return res.status(400).json({ error: 'Project is already assigned to this team' });
    }

    // Add project to team
    team.projects.push(projectId);
    team.updatedAt = Date.now();

    // Save updated team
    await team.save();

    // Populate references for the response
    const updatedTeam = await Team.findById(team._id)
      .populate('teamLeader', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate('projects', 'name description status progress')
      .populate('createdBy', 'name email avatar');

    res.json(updatedTeam);
  } catch (err) {
    console.error('Error adding project to team:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/teams/:id/projects/:projectId
// @desc    Remove a project from a team
// @access  Private
router.delete('/:id/projects/:projectId', ensureAuth, async (req, res) => {
  try {
    // Find team
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Remove project from team
    team.projects = team.projects.filter(project => 
      project.toString() !== req.params.projectId
    );

    team.updatedAt = Date.now();

    // Save updated team
    await team.save();

    // Populate references for the response
    const updatedTeam = await Team.findById(team._id)
      .populate('teamLeader', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .populate('projects', 'name description status progress')
      .populate('createdBy', 'name email avatar');

    res.json(updatedTeam);
  } catch (err) {
    console.error('Error removing project from team:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
