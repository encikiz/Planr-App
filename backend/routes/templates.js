/**
 * Templates API routes
 * Provides endpoints for project and team templates
 */
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/api-optimization');

// Predefined team templates
const teamTemplates = [
  {
    id: 1,
    name: "Design Team",
    description: "Team focused on UI/UX design and visual elements",
    roles: ["UI Designer", "UX Designer", "Visual Designer", "Design Lead"]
  },
  {
    id: 2,
    name: "Development Team",
    description: "Team responsible for software development",
    roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Tech Lead"]
  },
  {
    id: 3,
    name: "Marketing Team",
    description: "Team handling marketing and promotion",
    roles: ["Marketing Specialist", "Content Creator", "Social Media Manager", "Marketing Lead"]
  },
  {
    id: 4,
    name: "Product Team",
    description: "Team managing product development and strategy",
    roles: ["Product Manager", "Product Owner", "Business Analyst", "Product Lead"]
  }
];

// Predefined project templates
const projectTemplates = [
  {
    id: 1,
    name: "Website Development",
    description: "Template for website development projects",
    phases: ["Planning", "Design", "Development", "Testing", "Deployment"],
    defaultTasks: [
      { title: "Create wireframes", phase: "Design" },
      { title: "Design mockups", phase: "Design" },
      { title: "Develop frontend", phase: "Development" },
      { title: "Implement backend", phase: "Development" },
      { title: "QA testing", phase: "Testing" }
    ]
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "Template for mobile application projects",
    phases: ["Planning", "Design", "Development", "Testing", "Release"],
    defaultTasks: [
      { title: "Create app wireframes", phase: "Design" },
      { title: "Design UI/UX", phase: "Design" },
      { title: "Develop frontend", phase: "Development" },
      { title: "Implement backend", phase: "Development" },
      { title: "Beta testing", phase: "Testing" }
    ]
  }
];

/**
 * @route   GET /api/templates/teams
 * @desc    Get all team templates
 * @access  Private
 */
router.get('/teams', ensureAuth, asyncHandler(async (req, res) => {
  res.json(teamTemplates);
}));

/**
 * @route   GET /api/templates/teams/:id
 * @desc    Get a specific team template
 * @access  Private
 */
router.get('/teams/:id', ensureAuth, asyncHandler(async (req, res) => {
  const template = teamTemplates.find(t => t.id === parseInt(req.params.id));
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json(template);
}));

/**
 * @route   GET /api/templates/projects
 * @desc    Get all project templates
 * @access  Private
 */
router.get('/projects', ensureAuth, asyncHandler(async (req, res) => {
  res.json(projectTemplates);
}));

/**
 * @route   GET /api/templates/projects/:id
 * @desc    Get a specific project template
 * @access  Private
 */
router.get('/projects/:id', ensureAuth, asyncHandler(async (req, res) => {
  const template = projectTemplates.find(t => t.id === parseInt(req.params.id));
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json(template);
}));

module.exports = router;
