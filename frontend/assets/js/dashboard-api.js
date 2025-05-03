/**
 * Dashboard API Functions
 *
 * This file contains API functions for fetching data from the backend API
 * and provides caching to improve performance.
 */

// API cache to prevent redundant requests
const apiCache = {
    projects: null,
    tasks: null,
    teamMembers: null,
    activities: null,
    lastFetched: {
        projects: null,
        tasks: null,
        teamMembers: null,
        activities: null
    },
    // Cache expiration time in milliseconds (5 minutes)
    expirationTime: 5 * 60 * 1000
};

/**
 * Check if cached data is still valid
 * @param {string} dataType - Type of data to check
 * @returns {boolean} - Whether the cache is valid
 */
function isCacheValid(dataType) {
    const lastFetched = apiCache.lastFetched[dataType];
    if (!lastFetched) return false;

    const now = new Date().getTime();
    return (now - lastFetched) < apiCache.expirationTime;
}

/**
 * Fetch all dashboard data in a single request
 * @returns {Promise<Object>} - Object containing projects, tasks, and team members
 */
async function fetchDashboardData() {
    try {
        // For now, we'll fetch each data type separately
        // In a real application, you might have a single endpoint that returns all data
        const [projects, tasks, teamMembers] = await Promise.all([
            fetchProjects(),
            fetchTasks(),
            fetchTeamMembers()
        ]);

        return { projects, tasks, teamMembers };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
}

// Dashboard API functions for fetching real data

// Helper function to show notifications
function showDashboardNotification(message, type = 'info') {
    // Use the global showNotification function if available
    if (typeof window.showNotification === 'function' && window.showNotification !== showDashboardNotification) {
        window.showNotification(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Function to fetch all projects
async function fetchProjects() {
    // Return cached data if valid
    if (isCacheValid('projects') && apiCache.projects) {
        console.log('Using cached projects data');
        return apiCache.projects;
    }

    try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();

        // Update cache
        apiCache.projects = projects;
        apiCache.lastFetched.projects = new Date().getTime();

        return projects;
    } catch (error) {
        console.error('Error fetching projects:', error);
        showDashboardNotification('Failed to load projects', 'error');
        return [];
    }
}

// Function to fetch all tasks
async function fetchTasks() {
    // Return cached data if valid
    if (isCacheValid('tasks') && apiCache.tasks) {
        console.log('Using cached tasks data');
        return apiCache.tasks;
    }

    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();

        // Update cache
        apiCache.tasks = tasks;
        apiCache.lastFetched.tasks = new Date().getTime();

        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showDashboardNotification('Failed to load tasks', 'error');
        return [];
    }
}

// Function to fetch all team members
async function fetchTeamMembers() {
    // Return cached data if valid
    if (isCacheValid('teamMembers') && apiCache.teamMembers) {
        console.log('Using cached team members data');
        return apiCache.teamMembers;
    }

    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Failed to fetch team members');
        }

        const teamMembers = await response.json();

        // Update cache
        apiCache.teamMembers = teamMembers;
        apiCache.lastFetched.teamMembers = new Date().getTime();

        return teamMembers;
    } catch (error) {
        console.error('Error fetching team members:', error);
        showDashboardNotification('Failed to load team members', 'error');
        return [];
    }
}

// Function to fetch recent activities (placeholder for now)
// In a real application, you would have an API endpoint for activities
async function fetchRecentActivities() {
    // Return cached data if valid
    if (isCacheValid('activities') && apiCache.activities) {
        console.log('Using cached activities data');
        return apiCache.activities;
    }

    try {
        // This is a placeholder. In a real app, you would have an API endpoint for activities
        // For now, we'll generate some activities based on tasks and projects
        const [projects, tasks, users] = await Promise.all([
            fetchProjects(),
            fetchTasks(),
            fetchTeamMembers()
        ]);

        // Generate activities based on tasks and projects
        const activities = [];

        // Add activities for completed tasks
        const completedTasks = tasks.filter(task => task.status === 'completed');
        completedTasks.forEach(task => {
            const project = projects.find(p => p._id === task.projectId);
            const assignedUser = Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                ? task.assignedTo[0]
                : (task.assignedTo || {});

            if (project && assignedUser) {
                activities.push({
                    id: `task_${task._id}`,
                    type: 'task_completed',
                    user: assignedUser._id || assignedUser,
                    project: project._id,
                    task: task._id,
                    timestamp: task.updatedAt || new Date().toISOString(),
                    userName: assignedUser.name || 'Unknown User',
                    projectName: project.name,
                    taskName: task.name
                });
            }
        });

        // Add activities for in-progress tasks
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
        inProgressTasks.forEach(task => {
            const project = projects.find(p => p._id === task.projectId);
            const assignedUser = Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                ? task.assignedTo[0]
                : (task.assignedTo || {});

            if (project && assignedUser) {
                activities.push({
                    id: `task_${task._id}_start`,
                    type: 'task_started',
                    user: assignedUser._id || assignedUser,
                    project: project._id,
                    task: task._id,
                    timestamp: task.startDate || task.createdAt || new Date().toISOString(),
                    userName: assignedUser.name || 'Unknown User',
                    projectName: project.name,
                    taskName: task.name
                });
            }
        });

        // Add activities for project creation
        projects.forEach(project => {
            const creator = project.createdBy || {};

            activities.push({
                id: `project_${project._id}_created`,
                type: 'project_created',
                user: creator._id || creator,
                project: project._id,
                timestamp: project.createdAt || new Date().toISOString(),
                userName: creator.name || 'Unknown User',
                projectName: project.name
            });

            // Add activities for completed projects
            if (project.status === 'completed') {
                activities.push({
                    id: `project_${project._id}_completed`,
                    type: 'project_completed',
                    user: creator._id || creator,
                    project: project._id,
                    timestamp: project.updatedAt || new Date().toISOString(),
                    userName: creator.name || 'Unknown User',
                    projectName: project.name
                });
            }
        });

        // Sort activities by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Get the 10 most recent activities
        const recentActivities = activities.slice(0, 10);

        // Update cache
        apiCache.activities = recentActivities;
        apiCache.lastFetched.activities = new Date().getTime();

        return recentActivities;
    } catch (error) {
        console.error('Error generating activities:', error);
        showDashboardNotification('Failed to load activities', 'error');
        return [];
    }
}

// Function to get active projects (not completed)
async function getActiveProjects() {
    const projects = await fetchProjects();
    return projects.filter(project => project.status !== 'completed');
}

// Function to get completed tasks
async function getCompletedTasks() {
    const tasks = await fetchTasks();
    return tasks.filter(task => task.status === 'completed');
}

// Function to calculate average completion percentage
async function calculateAverageCompletion() {
    const projects = await fetchProjects();
    if (projects.length === 0) return 0;

    const totalProgress = projects.reduce((sum, project) => sum + project.progress, 0);
    return Math.round(totalProgress / projects.length);
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Helper function to get status label
function getStatusLabel(status) {
    switch (status) {
        case 'not-started':
            return 'Not Started';
        case 'in-progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        case 'on-hold':
            return 'On Hold';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

/**
 * Clear the API cache
 * @param {string} dataType - Type of data to clear (optional, clears all if not specified)
 */
function clearApiCache(dataType) {
    if (dataType) {
        apiCache[dataType] = null;
        apiCache.lastFetched[dataType] = null;
        console.log(`Cleared cache for ${dataType}`);
    } else {
        apiCache.projects = null;
        apiCache.tasks = null;
        apiCache.teamMembers = null;
        apiCache.activities = null;
        apiCache.lastFetched.projects = null;
        apiCache.lastFetched.tasks = null;
        apiCache.lastFetched.teamMembers = null;
        apiCache.lastFetched.activities = null;
        console.log('Cleared all API cache');
    }
}
