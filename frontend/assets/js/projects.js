// Projects page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the projects page before loading projects list
    if (document.getElementById('projects-list')) {
        // Load projects list
        loadProjectsList();
    } else {
        console.log('Not on projects page, skipping loadProjectsList');
    }

    // Set up event listeners
    setupEventListeners();

    // Check for hash fragments for quick actions
    checkForQuickActions();
});

// API functions
async function fetchProjects() {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching projects:', error);
        showNotification('Failed to load projects', 'error');
        return [];
    }
}

async function fetchProjectById(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch project');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching project:', error);
        showNotification('Failed to load project details', 'error');
        return null;
    }
}

async function fetchProjectTasks(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}/tasks`);
        if (!response.ok) {
            throw new Error('Failed to fetch project tasks');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching project tasks:', error);
        showNotification('Failed to load project tasks', 'error');
        return [];
    }
}

async function fetchProjectMilestones(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}/milestones`);
        if (!response.ok) {
            throw new Error('Failed to fetch project milestones');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching project milestones:', error);
        showNotification('Failed to load project milestones', 'error');
        return [];
    }
}

async function createProject(projectData) {
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            throw new Error('Failed to create project');
        }

        const newProject = await response.json();
        showNotification('Project created successfully', 'success');
        return newProject;
    } catch (error) {
        console.error('Error creating project:', error);
        showNotification('Failed to create project', 'error');
        return null;
    }
}

async function updateProject(projectId, projectData) {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            throw new Error('Failed to update project');
        }

        const updatedProject = await response.json();
        showNotification('Project updated successfully', 'success');
        return updatedProject;
    } catch (error) {
        console.error('Error updating project:', error);
        showNotification('Failed to update project', 'error');
        return null;
    }
}

async function deleteProject(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete project');
        }

        showNotification('Project deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('Failed to delete project', 'error');
        return false;
    }
}

function checkForQuickActions() {
    // Check if there's a hash in the URL
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);

        // Handle different quick actions
        if (hash === 'new-project') {
            // Open the improved new project modal directly
            openImprovedNewProjectModal();
        }
    }
}

async function loadProjectsList() {
    const projectsList = document.getElementById('projects-list');

    // Check if the projects-list element exists (it won't on pages like milestones.html)
    if (!projectsList) {
        console.log('Projects list element not found, skipping loadProjectsList');
        return;
    }

    // Only clear the content if the element exists
    projectsList.innerHTML = ''; // Clear any existing content

    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading projects...';
    projectsList.appendChild(loadingIndicator);

    try {
        // Fetch projects from API
        const projects = await fetchProjects();

        // Remove loading indicator
        projectsList.removeChild(loadingIndicator);

        // Render projects
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsList.removeChild(loadingIndicator);

        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to load projects. Please try again.';
        projectsList.appendChild(errorMessage);
    }
}

function renderProjects(projects) {
    const projectsList = document.getElementById('projects-list');

    // Initially hide all project details sections
    document.querySelectorAll('.project-info, .project-description, .project-team, .project-milestones, .project-tasks').forEach(el => {
        el.style.display = 'none';
    });

    const noProjectSelected = document.getElementById('no-project-selected');

    // Check if there are any projects
    if (!projects || projects.length === 0) {
        // Hide the "No Project Selected" message when there are no projects
        if (noProjectSelected) {
            noProjectSelected.style.display = 'none';
        }

        const noProjects = document.createElement('div');
        noProjects.className = 'no-projects';
        noProjects.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-project-diagram"></i>
                <h3>No Projects Found</h3>
                <p>Click the "New Project" button to create your first project</p>
            </div>
        `;
        projectsList.appendChild(noProjects);
        return;
    }

    // Show the "No Project Selected" message only when there are projects but none is selected
    if (noProjectSelected) {
        noProjectSelected.style.display = 'flex';
    }

    // Sort projects by status and priority
    const sortedProjects = [...projects].sort((a, b) => {
        const statusOrder = { 'in-progress': 1, 'planning': 2, 'not-started': 3, 'completed': 4 };
        const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };

        // First sort by status
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }

        // Then sort by priority
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sortedProjects.forEach((project, index) => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.dataset.id = project._id; // MongoDB uses _id

        projectItem.innerHTML = `
            <h4>${project.name}</h4>
            <div class="project-item-meta">
                <div class="meta-row">
                    <span class="project-status status-${project.status}">${getStatusLabel(project.status)}</span>
                    <span class="project-priority priority-${project.priority}">${getPriorityLabel(project.priority)}</span>
                </div>
                <div class="project-progress">
                    <div class="project-progress-label">
                        <span>Progress</span>
                        <span>${project.progress}%</span>
                    </div>
                    <div class="project-progress-bar">
                        <div class="project-progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
            </div>
        `;

        projectItem.addEventListener('click', () => {
            // Remove active class from all project items
            document.querySelectorAll('.project-item').forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to clicked project item
            projectItem.classList.add('active');

            // Load project details
            loadProjectDetails(project._id);
        });

        // Add staggered entrance animation
        projectItem.style.opacity = '0';
        projectItem.style.transform = 'translateX(-20px)';

        projectsList.appendChild(projectItem);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            projectItem.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            projectItem.style.opacity = '1';
            projectItem.style.transform = 'translateX(0)';
        }, index * 50);
    });

    // No longer automatically loading the first project
    // Projects will only be displayed when clicked
}

async function loadProjectDetails(projectId) {
    // Show the modal
    const projectDetailsModal = document.getElementById('project-details-modal');
    projectDetailsModal.classList.add('active');

    // Add a subtle loading effect
    const projectDetails = document.getElementById('project-details');
    projectDetails.style.opacity = '0.6';
    projectDetails.style.transform = 'translateY(20px)';

    // Show all project info elements
    document.querySelectorAll('.project-info, .project-description, .project-team, .project-milestones, .project-tasks').forEach(el => {
        el.style.display = '';
    });

    try {
        // Fetch project details from API
        const project = await fetchProjectById(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        // Animate the details container
        projectDetails.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        projectDetails.style.opacity = '1';
        projectDetails.style.transform = 'translateY(0)';

        // Update the content with project details
        updateProjectDetailsContent(project);
    } catch (error) {
        console.error('Error loading project details:', error);

        // Show error message
        projectDetails.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        projectDetails.style.opacity = '1';
        projectDetails.style.transform = 'translateY(0)';

        projectDetails.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Project</h3>
                <p>Failed to load project details. Please try again.</p>
                <button type="button" class="close-modal" onclick="closeProjectModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        showNotification('Failed to load project details', 'error');
    }
}

async function updateProjectDetailsContent(project) {
    // Update project title
    document.getElementById('project-title').textContent = project.name;

    // Update project status
    document.getElementById('project-status').textContent = getStatusLabel(project.status);
    document.getElementById('project-status').className = `value status-${project.status}`;

    // Update project priority
    document.getElementById('project-priority').textContent = getPriorityLabel(project.priority);

    // Update project timeline
    document.getElementById('project-timeline').textContent = `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`;

    // Update project progress
    const progressFill = document.getElementById('project-progress-fill');
    progressFill.style.width = '0%'; // Reset for animation
    progressFill.setAttribute('data-progress', project.progress);
    document.getElementById('project-progress-text').textContent = `${project.progress}%`;

    // Update project description
    document.getElementById('project-description').innerHTML = `<p>${project.description}</p>`;

    try {
        // Fetch project tasks
        const tasks = await fetchProjectTasks(project._id);

        // Fetch project milestones
        const milestones = await fetchProjectMilestones(project._id);

        // Update project teams (new functionality)
        loadProjectTeams(project);

        // Update legacy team members (will be removed after migration)
        loadProjectTeam(project);

        // Update project milestones
        if (typeof loadProjectMilestones === 'function') {
            loadProjectMilestones(project._id, milestones);
        }

        // Update project tasks
        loadProjectTasks(project, tasks);

        // Animate progress bar with a smoother animation
        setTimeout(() => {
            progressFill.style.transition = 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            progressFill.style.width = `${project.progress}%`;
        }, 300);
    } catch (error) {
        console.error('Error loading project details:', error);
        showNotification('Failed to load some project details', 'warning');
    }
}

function loadProjectTeam(project) {
    const projectTeam = document.getElementById('project-team');
    projectTeam.innerHTML = '';

    // Add a subtle fade-in animation to the container
    projectTeam.style.opacity = '0';
    setTimeout(() => {
        projectTeam.style.transition = 'opacity 0.5s ease';
        projectTeam.style.opacity = '1';
    }, 400);

    if (!project.teamMembers || project.teamMembers.length === 0) {
        projectTeam.innerHTML = '<p>No team members assigned</p>';
        return;
    }

    project.teamMembers.forEach((member, index) => {
        if (!member) return;

        const teamAvatar = document.createElement('div');
        teamAvatar.className = 'team-avatar';

        // Get member avatar or generate one
        const avatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`;

        teamAvatar.innerHTML = `
            <img src="${avatar}" alt="${member.name}">
            <span class="tooltip">${member.name} - ${member.role || 'Team Member'}</span>
        `;

        // Add a staggered entrance animation
        teamAvatar.style.opacity = '0';
        teamAvatar.style.transform = 'scale(0.8)';

        projectTeam.appendChild(teamAvatar);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            teamAvatar.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            teamAvatar.style.opacity = '1';
            teamAvatar.style.transform = 'scale(1)';
        }, 500 + (index * 100));
    });
}

function loadProjectTasks(project, tasks = []) {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';

    // Add a subtle fade-in animation to the container
    tasksList.style.opacity = '0';
    setTimeout(() => {
        tasksList.style.transition = 'opacity 0.5s ease';
        tasksList.style.opacity = '1';
    }, 600);

    if (tasks.length === 0) {
        tasksList.innerHTML = '<p>No tasks for this project</p>';
        return;
    }

    // Sort tasks by status and priority
    const sortedTasks = [...tasks].sort((a, b) => {
        const statusOrder = { 'in-progress': 1, 'not-started': 2, 'completed': 3 };
        const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };

        // First sort by status
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }

        // Then sort by priority
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sortedTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.dataset.id = task._id;

        // Get assigned team members
        let assignedMembers = [];
        if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
            assignedMembers = task.assignedTo;
        }

        // Create avatars HTML for assigned members
        const avatarsHTML = assignedMembers.length > 0
            ? assignedMembers.map(member => `
                <div class="avatar" title="${member.name}">
                    <img src="${member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}" alt="${member.name}">
                </div>
            `).join('')
            : `<div class="avatar" title="Unassigned"><img src="https://ui-avatars.com/api/?name=Unassigned&background=cccccc&color=fff" alt="Unassigned"></div>`;

        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="task-${task._id}" ${task.status === 'completed' ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <h5>${task.name}</h5>
                <p>${task.description}</p>
                <div class="task-meta">
                    <span class="task-status status-${task.status}">${getStatusLabel(task.status)}</span>
                    <span class="task-priority">Priority: ${getPriorityLabel(task.priority)}</span>
                    <span class="task-due">Due: ${formatDate(task.dueDate)}</span>
                </div>
                <div class="task-assigned">
                    <span class="assigned-label">Assigned to:</span>
                    <div class="assigned-avatars">
                        ${avatarsHTML}
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button type="button" class="task-edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="task-delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add a staggered entrance animation
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateY(10px)';

        tasksList.appendChild(taskItem);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            taskItem.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            taskItem.style.opacity = '1';
            taskItem.style.transform = 'translateY(0)';
        }, 700 + (index * 50));
    });

    // Add event listeners to task items
    addTaskEventListeners(project._id);
}

function setupEventListeners() {
    // Check if we're on the projects page
    if (!document.getElementById('projects-list')) {
        console.log('Not on projects page, skipping project-specific event listeners');
        return;
    }

    // Project search functionality
    const projectSearch = document.getElementById('project-search');
    if (projectSearch) {
        projectSearch.addEventListener('input', filterProjects);
    }

    // Status filter functionality
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterProjects);
    }

    // Priority filter functionality
    const priorityFilter = document.getElementById('priority-filter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterProjects);
    }

    // Close modal button
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeProjectModal);
    }

    // Close modal when clicking outside the content
    const projectDetailsModal = document.getElementById('project-details-modal');
    if (projectDetailsModal) {
        projectDetailsModal.addEventListener('click', (e) => {
            if (e.target === projectDetailsModal) {
                closeProjectModal();
            }
        });
    }

    // New project button
    const newProjectBtn = document.querySelector('.new-project-btn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
            openImprovedNewProjectModal();
        });
    }

    // New task button
    const newTaskBtn = document.querySelector('.new-task-btn');
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', () => {
            const projectId = getCurrentProjectId();
            if (projectId) {
                openTaskModal('add', projectId);
            } else {
                showNotification('Please select a project first', 'warning');
            }
        });
    }

    // New milestone button
    const newMilestoneBtn = document.querySelector('.new-milestone-btn');
    if (newMilestoneBtn) {
        newMilestoneBtn.addEventListener('click', () => {
            const projectId = getCurrentProjectId();
            if (projectId) {
                openMilestoneModal('add', projectId);
            } else {
                showNotification('Please select a project first', 'warning');
            }
        });
    }

    // Edit project button
    const editBtn = document.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const projectId = getCurrentProjectId();
            if (projectId) {
                openEditProjectModal(projectId);
            } else {
                showNotification('No project selected', 'warning');
            }
        });
    }

    // Delete project button
    const deleteBtn = document.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const projectId = getCurrentProjectId();
            if (projectId) {
                confirmDeleteProject(projectId);
            } else {
                showNotification('No project selected', 'warning');
            }
        });
    }
}

function closeProjectModal() {
    const projectDetailsModal = document.getElementById('project-details-modal');
    if (projectDetailsModal) {
        projectDetailsModal.classList.remove('active');
    }
}

function filterProjects() {
    const searchTerm = document.getElementById('project-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;

    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(async item => {
        // Get project ID from dataset (MongoDB ObjectId)
        const projectId = item.dataset.id;

        try {
            // Fetch the project directly from the API instead of using getProject
            const project = await fetchProjectById(projectId);

            if (!project) return;

            const matchesSearch = project.name.toLowerCase().includes(searchTerm) ||
                                project.description.toLowerCase().includes(searchTerm);

            const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

            const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

            if (matchesSearch && matchesStatus && matchesPriority) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        } catch (error) {
            console.error('Error filtering project:', error);
            // Hide the item if there's an error
            item.style.display = 'none';
        }
    });
}

function getCurrentProjectId() {
    const projectDetailsModal = document.getElementById('project-details-modal');
    if (projectDetailsModal && projectDetailsModal.classList.contains('active')) {
        const activeProject = document.querySelector('.project-item.active');
        if (activeProject) {
            // Return the MongoDB ObjectId as a string
            return activeProject.dataset.id;
        }
    }
    return null;
}

// Function to open the new project modal
function openNewProjectModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('new-project-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'new-project-modal';
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create New Project</h3>
                    <button type="button" class="close-modal" id="close-new-project-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="new-project-form">
                        <div class="form-group">
                            <label for="project-name">Project Name</label>
                            <input type="text" id="project-name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="project-description">Description (Optional)</label>
                            <textarea id="project-description" name="description" rows="3" placeholder="Enter project description..."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label for="project-start-date">Start Date</label>
                                <input type="date" id="project-start-date" name="startDate" required>
                            </div>
                            <div class="form-group half">
                                <label for="project-end-date">End Date</label>
                                <input type="date" id="project-end-date" name="endDate" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group half">
                                <label for="project-status">Status</label>
                                <select id="project-status" name="status" required>
                                    <option value="not-started">Not Started</option>
                                    <option value="planning">Planning</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div class="form-group half">
                                <label for="project-priority">Priority</label>
                                <select id="project-priority" name="priority" required>
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="project-team">Team Members</label>
                            <div class="team-selection" id="team-selection"></div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn" id="cancel-new-project">Cancel</button>
                            <button type="submit" class="submit-btn">Create Project</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('close-new-project-modal').addEventListener('click', closeNewProjectModal);
        document.getElementById('cancel-new-project').addEventListener('click', closeNewProjectModal);
        document.getElementById('new-project-form').addEventListener('submit', handleNewProjectSubmit);
    }

    // Set default dates
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Default end date is 1 month from now

    document.getElementById('project-start-date').value = formatDateForInput(today);
    document.getElementById('project-end-date').value = formatDateForInput(endDate);

    // Render team members selection
    renderTeamMemberSelection('team-selection');

    // Show the modal
    modal.classList.add('active');
}

// Function to close the new project modal
function closeNewProjectModal() {
    const modal = document.getElementById('new-project-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Function to handle new project form submission
async function handleNewProjectSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Get selected team members
    const teamMembers = getSelectedTeamMembers('team-selection');

    // Get current user information
    let userName = "User";
    try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
            const userData = await response.json();
            userName = userData.name || "User";
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    // Set default description if empty
    let description = formData.get('description');
    if (!description || description.trim() === '') {
        description = `Project created by ${userName}`;
    }

    // Create project data object
    const projectData = {
        name: formData.get('name'),
        description: description,
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        progress: formData.get('status') === 'completed' ? 100 : 0,
        teamMembers: teamMembers
    };

    try {
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        // Create the project
        const newProject = await createProject(projectData);

        if (newProject) {
            // Close the modal
            closeNewProjectModal();

            // Reload the projects list
            await loadProjectsList();

            // Show success message
            showNotification('Project created successfully', 'success');
        } else {
            throw new Error('Failed to create project');
        }
    } catch (error) {
        console.error('Error creating project:', error);
        showNotification('Failed to create project', 'error');
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Project';
    }
}

// Helper function to format date for input fields
function formatDateForInput(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// Function to open the edit project modal
async function openEditProjectModal(projectId) {
    try {
        // Fetch the project data
        const project = await fetchProjectById(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        // Create modal if it doesn't exist
        let modal = document.getElementById('edit-project-modal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'edit-project-modal';
            modal.className = 'modal';

            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Project</h3>
                        <button type="button" class="close-modal" id="close-edit-project-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-project-form">
                            <input type="hidden" id="edit-project-id" name="projectId">
                            <div class="form-group">
                                <label for="edit-project-name">Project Name</label>
                                <input type="text" id="edit-project-name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-project-description">Description (Optional)</label>
                                <textarea id="edit-project-description" name="description" rows="3" placeholder="Enter project description or leave empty for default..."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label for="edit-project-start-date">Start Date</label>
                                    <input type="date" id="edit-project-start-date" name="startDate" required>
                                </div>
                                <div class="form-group half">
                                    <label for="edit-project-end-date">End Date</label>
                                    <input type="date" id="edit-project-end-date" name="endDate" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label for="edit-project-status">Status</label>
                                    <select id="edit-project-status" name="status" required>
                                        <option value="not-started">Not Started</option>
                                        <option value="planning">Planning</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div class="form-group half">
                                    <label for="edit-project-priority">Priority</label>
                                    <select id="edit-project-priority" name="priority" required>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="edit-project-progress">Progress</label>
                                <div class="progress-slider-container">
                                    <input type="range" id="edit-project-progress" name="progress" min="0" max="100" step="5" value="0">
                                    <span id="progress-value">0%</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="edit-project-team">Team Members</label>
                                <div class="team-selection" id="edit-team-selection"></div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="cancel-btn" id="cancel-edit-project">Cancel</button>
                                <button type="submit" class="submit-btn">Update Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            document.getElementById('close-edit-project-modal').addEventListener('click', closeEditProjectModal);
            document.getElementById('cancel-edit-project').addEventListener('click', closeEditProjectModal);
            document.getElementById('edit-project-form').addEventListener('submit', handleEditProjectSubmit);

            // Add progress slider event listener
            const progressSlider = document.getElementById('edit-project-progress');
            const progressValue = document.getElementById('progress-value');

            progressSlider.addEventListener('input', function() {
                progressValue.textContent = this.value + '%';
            });
        }

        // Fill the form with project data
        document.getElementById('edit-project-id').value = project._id;
        document.getElementById('edit-project-name').value = project.name;
        document.getElementById('edit-project-description').value = project.description;
        document.getElementById('edit-project-start-date').value = formatDateForInput(project.startDate);
        document.getElementById('edit-project-end-date').value = formatDateForInput(project.endDate);
        document.getElementById('edit-project-status').value = project.status;
        document.getElementById('edit-project-priority').value = project.priority;
        document.getElementById('edit-project-progress').value = project.progress;
        document.getElementById('progress-value').textContent = project.progress + '%';

        // Render team members selection
        renderTeamMemberSelection('edit-team-selection', project.teamMembers || []);

        // Show the modal
        modal.classList.add('active');
    } catch (error) {
        console.error('Error opening edit project modal:', error);
        showNotification('Failed to load project for editing', 'error');
    }
}

// Function to close the edit project modal
function closeEditProjectModal() {
    const modal = document.getElementById('edit-project-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Function to handle edit project form submission
async function handleEditProjectSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const projectId = formData.get('projectId');

    // Get selected team members
    const teamMembers = getSelectedTeamMembers('edit-team-selection');

    // Get current user information
    let userName = "User";
    try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
            const userData = await response.json();
            userName = userData.name || "User";
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    // Set default description if empty
    let description = formData.get('description');
    if (!description || description.trim() === '') {
        description = `Project created by ${userName}`;
    }

    // Create project data object
    const projectData = {
        name: formData.get('name'),
        description: description,
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        progress: parseInt(formData.get('progress')),
        teamMembers: teamMembers
    };

    try {
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        // Update the project
        const updatedProject = await updateProject(projectId, projectData);

        if (updatedProject) {
            // Close the modal
            closeEditProjectModal();

            // Reload the projects list
            await loadProjectsList();

            // If the project details modal is open, reload the project details
            const projectDetailsModal = document.getElementById('project-details-modal');
            if (projectDetailsModal && projectDetailsModal.classList.contains('active')) {
                await loadProjectDetails(projectId);
            }

            // Show success message
            showNotification('Project updated successfully', 'success');
        } else {
            throw new Error('Failed to update project');
        }
    } catch (error) {
        console.error('Error updating project:', error);
        showNotification('Failed to update project', 'error');
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Update Project';
    }
}

// Function to confirm project deletion
function confirmDeleteProject(projectId) {
    // Create confirmation modal if it doesn't exist
    let modal = document.getElementById('confirm-delete-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirm-delete-modal';
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirm Delete</h3>
                    <button type="button" class="close-modal" id="close-confirm-delete">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this project? This action cannot be undone.</p>
                    <p class="warning">All tasks and milestones associated with this project will also be deleted.</p>
                    <input type="hidden" id="delete-project-id">
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" id="cancel-delete-project">Cancel</button>
                        <button type="button" class="delete-btn" id="confirm-delete-project">Delete Project</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('close-confirm-delete').addEventListener('click', closeConfirmDeleteModal);
        document.getElementById('cancel-delete-project').addEventListener('click', closeConfirmDeleteModal);
        document.getElementById('confirm-delete-project').addEventListener('click', handleDeleteProject);
    }

    // Set the project ID
    document.getElementById('delete-project-id').value = projectId;

    // Show the modal
    modal.classList.add('active');
}

// Function to close the confirm delete modal
function closeConfirmDeleteModal() {
    const modal = document.getElementById('confirm-delete-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Function to handle project deletion
async function handleDeleteProject() {
    const projectId = document.getElementById('delete-project-id').value;

    if (!projectId) {
        showNotification('No project selected for deletion', 'error');
        return;
    }

    try {
        // Show loading state
        const deleteBtn = document.getElementById('confirm-delete-project');
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

        // Delete the project
        const success = await deleteProject(projectId);

        if (success) {
            // Close the modals
            closeConfirmDeleteModal();
            closeProjectModal();

            // Reload the projects list
            await loadProjectsList();

            // Show success message
            showNotification('Project deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete project');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('Failed to delete project', 'error');
    } finally {
        // Reset button state
        const deleteBtn = document.getElementById('confirm-delete-project');
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = 'Delete Project';
    }
}

// Function to add event listeners to task items
function addTaskEventListeners(projectId) {
    // Task checkboxes (mark as completed)
    document.querySelectorAll('.task-checkbox input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
            const taskId = this.closest('.task-item').dataset.id;

            try {
                // Fetch the task
                const task = await fetchTaskById(taskId);
                if (!task) {
                    throw new Error('Task not found');
                }

                // Update task status
                const updatedTask = {
                    ...task,
                    status: this.checked ? 'completed' : 'in-progress',
                    progress: this.checked ? 100 : task.progress
                };

                // Update the task
                const result = await updateTask(taskId, updatedTask);

                if (result) {
                    // Update the UI
                    const taskItem = this.closest('.task-item');
                    const statusSpan = taskItem.querySelector('.task-status');
                    statusSpan.className = `task-status status-${updatedTask.status}`;
                    statusSpan.textContent = getStatusLabel(updatedTask.status);

                    // Show notification
                    showNotification(`Task marked as ${getStatusLabel(updatedTask.status)}`, 'success');
                } else {
                    throw new Error('Failed to update task');
                }
            } catch (error) {
                console.error('Error updating task status:', error);
                showNotification('Failed to update task status', 'error');

                // Reset checkbox to original state
                this.checked = !this.checked;
            }
        });
    });

    // Edit task buttons
    document.querySelectorAll('.task-edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.closest('.task-item').dataset.id;
            openTaskModal('edit', projectId, taskId);
        });
    });

    // Delete task buttons
    document.querySelectorAll('.task-delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.closest('.task-item').dataset.id;
            confirmDeleteTask(taskId);
        });
    });
}
