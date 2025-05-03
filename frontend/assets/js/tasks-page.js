// Tasks page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the tasks page
    initializeTasksPage();

    // Set up event listeners
    setupTasksPageEventListeners();

    // Check for hash fragments for quick actions
    checkForQuickActions();
});

function checkForQuickActions() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Check for 'new' parameter
    const newTask = urlParams.get('new');
    if (newTask === 'true') {
        // Get project ID from URL if available
        const projectId = urlParams.get('project');
        const milestoneId = urlParams.get('milestone');

        // Open new task modal with project ID if available
        setTimeout(async () => {
            if (projectId) {
                try {
                    // Verify project exists
                    const project = await fetchProjectById(projectId);
                    if (project) {
                        openTaskModal('add', projectId, null, milestoneId);
                        return;
                    }
                } catch (error) {
                    console.error('Error fetching project:', error);
                }
            }

            // If no project ID or project not found, trigger new task button
            const newTaskBtn = document.querySelector('.new-task-btn');
            if (newTaskBtn) {
                newTaskBtn.click();
            }
        }, 500);
        return;
    }

    // Check if there's a hash in the URL
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);

        // Handle different quick actions
        if (hash === 'new-task') {
            // Trigger new task button click
            const newTaskBtn = document.querySelector('.new-task-btn');
            if (newTaskBtn) {
                newTaskBtn.click();
            }
        }
    }
}

function initializeTasksPage() {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    // Load data with a slight delay for better UX
    setTimeout(() => {
        // Load task analytics
        loadTaskAnalytics();

        // Load filter options
        loadFilterOptions();

        // Load tasks
        loadAllTasks();

        // Hide loading overlay with fade-out effect
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }, 500);
}

async function loadTaskAnalytics() {
    try {
        // Fetch tasks from API
        const tasks = await fetchTasks();

        // Get task counts
        const totalTasks = tasks.length;
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;

        // Calculate overdue tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueTasks = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate < today && task.status !== 'completed';
        }).length;

        // Update the metrics with animation
        animateCounter('total-tasks-count', 0, totalTasks);
        animateCounter('in-progress-tasks-count', 0, inProgressTasks);
        animateCounter('completed-tasks-count', 0, completedTasks);
        animateCounter('overdue-tasks-count', 0, overdueTasks);
    } catch (error) {
        console.error('Error loading task analytics:', error);
        showNotification('Failed to load task analytics', 'error');

        // Set all counters to 0 if there's an error
        animateCounter('total-tasks-count', 0, 0);
        animateCounter('in-progress-tasks-count', 0, 0);
        animateCounter('completed-tasks-count', 0, 0);
        animateCounter('overdue-tasks-count', 0, 0);
    }
}

function animateCounter(elementId, start, end, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    const increment = (end - start) / totalFrames;

    let currentFrame = 0;
    let currentValue = start;

    const animate = () => {
        currentFrame++;
        currentValue += increment;

        if (currentFrame === totalFrames) {
            element.textContent = end + suffix;
        } else {
            element.textContent = Math.floor(currentValue) + suffix;
            requestAnimationFrame(animate);
        }
    };

    animate();
}

async function loadFilterOptions() {
    try {
        // Fetch projects from API
        const projects = await fetch('/api/projects').then(res => res.json());

        // Load projects for filter
        const projectFilter = document.getElementById('project-filter');
        if (projectFilter) {
            // Clear existing options except the first one
            while (projectFilter.options.length > 1) {
                projectFilter.remove(1);
            }

            // Add project options
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project._id;
                option.textContent = project.name;
                projectFilter.appendChild(option);
            });
        }

        // Fetch users from API
        const users = await fetch('/api/users').then(res => res.json());

        // Load team members for assignee filter
        const assigneeFilter = document.getElementById('assignee-filter');
        if (assigneeFilter) {
            // Clear existing options except the first one
            while (assigneeFilter.options.length > 1) {
                assigneeFilter.remove(1);
            }

            // Add team member options
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user._id;
                option.textContent = user.name;
                assigneeFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading filter options:', error);
        showNotification('Failed to load filter options', 'error');
    }
}

async function loadAllTasks() {
    try {
        // Show loading state
        document.getElementById('tasks-list').innerHTML = '<div class="loading-spinner"></div>';
        document.getElementById('task-boards').innerHTML = '<div class="loading-spinner"></div>';

        // Get filter values
        const projectFilter = document.getElementById('project-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const priorityFilter = document.getElementById('priority-filter').value;
        const assigneeFilter = document.getElementById('assignee-filter').value;
        const searchTerm = document.getElementById('task-search').value.toLowerCase();
        const sortBy = document.getElementById('sort-by').value;
        const groupBy = document.getElementById('group-by').value;

        // Fetch all tasks from API
        const tasks = await fetchTasks();

        // Filter tasks
        let filteredTasks = tasks.filter(task => {
            // Project filter
            if (projectFilter !== 'all' && task.projectId._id !== projectFilter) {
                return false;
            }

            // Status filter
            if (statusFilter !== 'all' && task.status !== statusFilter) {
                return false;
            }

            // Priority filter
            if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
                return false;
            }

            // Assignee filter
            if (assigneeFilter !== 'all') {
                if (Array.isArray(task.assignedTo)) {
                    if (!task.assignedTo.some(user => user._id === assigneeFilter)) {
                        return false;
                    }
                }
            }

            // Search term
            if (searchTerm) {
                const projectName = task.projectId ? task.projectId.name.toLowerCase() : '';
                const taskName = task.name ? task.name.toLowerCase() : '';
                const taskDesc = task.description ? task.description.toLowerCase() : '';

                return taskName.includes(searchTerm) ||
                       taskDesc.includes(searchTerm) ||
                       projectName.includes(searchTerm);
            }

            return true;
        });

        // Sort tasks
        filteredTasks = sortTasks(filteredTasks, sortBy);

        // Check if there are any tasks after filtering
        if (filteredTasks.length === 0) {
            document.getElementById('no-tasks-message').classList.remove('hidden');
            document.getElementById('list-view').classList.add('hidden');
            document.getElementById('board-view').classList.add('hidden');
            return;
        } else {
            document.getElementById('no-tasks-message').classList.add('hidden');

            // Show the active view
            const activeView = document.querySelector('.view-btn.active').dataset.view;
            document.getElementById('list-view').classList.toggle('hidden', activeView !== 'list');
            document.getElementById('board-view').classList.toggle('hidden', activeView !== 'board');
        }

        // Group tasks if needed
        if (groupBy !== 'none') {
            renderGroupedTasks(filteredTasks, groupBy);
        } else {
            renderTasks(filteredTasks);
        }

        // Render board view if active
        const activeView = document.querySelector('.view-btn.active').dataset.view;
        if (activeView === 'board') {
            renderBoardView(filteredTasks);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Failed to load tasks', 'error');
        document.getElementById('no-tasks-message').classList.remove('hidden');
    }
}

function sortTasks(tasks, sortBy) {
    return [...tasks].sort((a, b) => {
        switch (sortBy) {
            case 'due-date-asc':
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'due-date-desc':
                return new Date(b.dueDate) - new Date(a.dueDate);
            case 'priority-desc':
                const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'priority-asc':
                const priorityOrderAsc = { 'low': 1, 'medium': 2, 'high': 3 };
                return priorityOrderAsc[a.priority] - priorityOrderAsc[b.priority];
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });
}

function renderTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';

    // Add a subtle fade-in animation to the container
    tasksList.style.opacity = '0';
    setTimeout(() => {
        tasksList.style.transition = 'opacity 0.5s ease';
        tasksList.style.opacity = '1';
    }, 100);

    tasks.forEach((task, index) => {
        const taskItem = createTaskItem(task);

        // Add a staggered entrance animation
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateY(10px)';

        tasksList.appendChild(taskItem);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            taskItem.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            taskItem.style.opacity = '1';
            taskItem.style.transform = 'translateY(0)';
        }, 200 + (index * 30));
    });

    // Add event listeners to task items
    addTaskEventListeners();
}

function renderGroupedTasks(tasks, groupBy) {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';

    // Add a subtle fade-in animation to the container
    tasksList.style.opacity = '0';
    setTimeout(() => {
        tasksList.style.transition = 'opacity 0.5s ease';
        tasksList.style.opacity = '1';
    }, 100);

    // Group tasks
    const groupedTasks = {};

    tasks.forEach(task => {
        let groupKey;
        let groupLabel;

        switch (groupBy) {
            case 'project':
                groupKey = task.projectId._id;
                groupLabel = task.projectId ? task.projectId.name : 'Unknown Project';
                break;
            case 'status':
                groupKey = task.status;
                groupLabel = getStatusLabel(task.status);
                break;
            case 'priority':
                groupKey = task.priority;
                groupLabel = getPriorityLabel(task.priority);
                break;
            case 'assignee':
                // For tasks with multiple assignees, we'll add the task to each assignee's group
                if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
                    task.assignedTo.forEach(assignee => {
                        const key = `assignee-${assignee._id}`;
                        if (!groupedTasks[key]) {
                            groupedTasks[key] = {
                                label: assignee.name || 'Unknown',
                                tasks: []
                            };
                        }
                        groupedTasks[key].tasks.push(task);
                    });
                    return; // Skip the default grouping below
                } else {
                    groupKey = 'unassigned';
                    groupLabel = 'Unassigned';
                }
                break;
            default:
                groupKey = 'none';
                groupLabel = 'All Tasks';
        }

        if (!groupedTasks[groupKey]) {
            groupedTasks[groupKey] = {
                label: groupLabel,
                tasks: []
            };
        }

        groupedTasks[groupKey].tasks.push(task);
    });

    // Render each group
    let groupIndex = 0;
    for (const groupKey in groupedTasks) {
        const group = groupedTasks[groupKey];

        // Create group header
        const groupHeader = document.createElement('div');
        groupHeader.className = 'task-group-header';
        groupHeader.innerHTML = `
            <span>${group.label}</span>
            <span class="count">${group.tasks.length}</span>
        `;

        tasksList.appendChild(groupHeader);

        // Create tasks for this group
        group.tasks.forEach((task, taskIndex) => {
            const taskItem = createTaskItem(task);

            // Add a staggered entrance animation
            taskItem.style.opacity = '0';
            taskItem.style.transform = 'translateY(10px)';

            tasksList.appendChild(taskItem);

            // Trigger the animation with a staggered delay
            setTimeout(() => {
                taskItem.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                taskItem.style.opacity = '1';
                taskItem.style.transform = 'translateY(0)';
            }, 200 + (groupIndex * 50) + (taskIndex * 30));
        });

        groupIndex++;
    }

    // Add event listeners to task items
    addTaskEventListeners();
}

function renderBoardView(tasks) {
    const taskBoards = document.getElementById('task-boards');
    taskBoards.innerHTML = '';

    // Define the boards based on status
    const boards = [
        { id: 'not-started', label: 'Not Started', icon: 'fa-clock' },
        { id: 'in-progress', label: 'In Progress', icon: 'fa-spinner' },
        { id: 'completed', label: 'Completed', icon: 'fa-check-circle' }
    ];

    // Create each board
    boards.forEach((board, boardIndex) => {
        const boardTasks = tasks.filter(task => task.status === board.id);

        const boardElement = document.createElement('div');
        boardElement.className = 'task-board';
        boardElement.innerHTML = `
            <div class="board-header">
                <div class="board-title">
                    <i class="fas ${board.icon}"></i>
                    ${board.label}
                </div>
                <div class="board-count">${boardTasks.length}</div>
            </div>
            <div class="board-tasks" id="board-${board.id}"></div>
        `;

        taskBoards.appendChild(boardElement);

        // Add tasks to this board
        const boardTasksContainer = boardElement.querySelector(`#board-${board.id}`);

        boardTasks.forEach((task, taskIndex) => {
            const taskElement = createBoardTaskItem(task);

            // Add a staggered entrance animation
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateY(10px)';

            boardTasksContainer.appendChild(taskElement);

            // Trigger the animation with a staggered delay
            setTimeout(() => {
                taskElement.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                taskElement.style.opacity = '1';
                taskElement.style.transform = 'translateY(0)';
            }, 200 + (boardIndex * 100) + (taskIndex * 30));
        });
    });

    // Add event listeners to board task items
    addBoardTaskEventListeners();
}

function createTaskItem(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.id = task._id;

    // Get project
    const projectName = task.projectId ? task.projectId.name : 'Unknown Project';

    // Check if task is overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < today && task.status !== 'completed';

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
                <span class="task-project">${projectName}</span>
                <span class="task-status status-${task.status}">${getStatusLabel(task.status)}</span>
                <span class="task-priority priority-${task.priority}">Priority: ${getPriorityLabel(task.priority)}</span>
                <span class="task-due ${isOverdue ? 'overdue' : ''}">Due: ${formatDate(task.dueDate)}${isOverdue ? ' (Overdue)' : ''}</span>
            </div>
            <div class="task-progress">
                <div class="task-progress-label">
                    <span>Progress</span>
                    <span>${task.progress}%</span>
                </div>
                <div class="task-progress-bar">
                    <div class="task-progress-fill" style="width: ${task.progress}%"></div>
                </div>
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

    return taskItem;
}

function createBoardTaskItem(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'board-task';
    taskElement.dataset.id = task._id;

    // Check if task is overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < today && task.status !== 'completed';

    // Get assigned team members
    let assignedMembers = [];
    if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
        assignedMembers = task.assignedTo;
    }

    // Create avatars HTML for assigned members (limit to 3 for board view)
    const displayMembers = assignedMembers.slice(0, 3);
    const avatarsHTML = displayMembers.length > 0
        ? displayMembers.map(member => `
            <div class="avatar" title="${member.name}">
                <img src="${member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}" alt="${member.name}">
            </div>
        `).join('')
        : `<div class="avatar" title="Unassigned"><img src="https://ui-avatars.com/api/?name=Unassigned&background=cccccc&color=fff" alt="Unassigned"></div>`;

    // Show +X more if there are more than 3 assignees
    const moreAssigneesHTML = assignedMembers.length > 3
        ? `<div class="avatar more-assignees" title="${assignedMembers.length - 3} more">+${assignedMembers.length - 3}</div>`
        : '';

    // Get project
    const projectName = task.projectId ? task.projectId.name : 'Unknown Project';

    taskElement.innerHTML = `
        <h5>${task.name}</h5>
        <div class="task-project">${projectName}</div>
        <div class="board-task-progress">
            <div class="board-task-progress-bar">
                <div class="board-task-progress-fill" style="width: ${task.progress}%"></div>
            </div>
            <span class="board-task-progress-value">${task.progress}%</span>
        </div>
        <div class="board-task-meta">
            <span class="board-task-due ${isOverdue ? 'overdue' : ''}">${formatDate(task.dueDate)}</span>
            <div class="board-task-assignees">
                ${avatarsHTML}
                ${moreAssigneesHTML}
            </div>
        </div>
    `;

    return taskElement;
}

function addTaskEventListeners() {
    // Task checkboxes (mark as completed)
    document.querySelectorAll('.task-checkbox input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
            const taskId = this.closest('.task-item').dataset.id;
            try {
                // Get current task data
                const response = await fetch(`/api/tasks/${taskId}`);
                if (!response.ok) throw new Error('Failed to fetch task');
                const task = await response.json();

                // Update task status
                const newStatus = this.checked ? 'completed' : 'in-progress';
                const updateResponse = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...task,
                        status: newStatus,
                        progress: this.checked ? 100 : task.progress
                    })
                });

                if (!updateResponse.ok) throw new Error('Failed to update task');

                // Update the UI
                const taskItem = this.closest('.task-item');
                const statusSpan = taskItem.querySelector('.task-status');
                statusSpan.className = `task-status status-${newStatus}`;
                statusSpan.textContent = getStatusLabel(newStatus);

                // Show notification
                showNotification(`Task marked as ${getStatusLabel(newStatus)}`, 'success');

                // Reload tasks to update grouping if needed
                loadAllTasks();
                loadTaskAnalytics();
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
        button.addEventListener('click', async function() {
            const taskId = this.closest('.task-item').dataset.id;
            try {
                // Get task data
                const response = await fetch(`/api/tasks/${taskId}`);
                if (!response.ok) throw new Error('Failed to fetch task');
                const task = await response.json();

                // Open task modal with the task data
                openTaskModal('edit', task.projectId._id, taskId);
            } catch (error) {
                console.error('Error fetching task for edit:', error);
                showNotification('Failed to load task details', 'error');
            }
        });
    });

    // Delete task buttons
    document.querySelectorAll('.task-delete-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const taskId = this.closest('.task-item').dataset.id;
            if (confirm('Are you sure you want to delete this task?')) {
                try {
                    const response = await fetch(`/api/tasks/${taskId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) throw new Error('Failed to delete task');

                    showNotification('Task deleted successfully', 'success');

                    // Reload tasks after deletion
                    loadAllTasks();
                    loadTaskAnalytics();
                } catch (error) {
                    console.error('Error deleting task:', error);
                    showNotification('Failed to delete task', 'error');
                }
            }
        });
    });
}

function addBoardTaskEventListeners() {
    // Board task items (click to edit)
    document.querySelectorAll('.board-task').forEach(taskElement => {
        taskElement.addEventListener('click', async function() {
            const taskId = this.dataset.id;
            try {
                // Get task data
                const response = await fetch(`/api/tasks/${taskId}`);
                if (!response.ok) throw new Error('Failed to fetch task');
                const task = await response.json();

                // Open task modal with the task data
                openTaskModal('edit', task.projectId._id, taskId);
            } catch (error) {
                console.error('Error fetching task for edit:', error);
                showNotification('Failed to load task details', 'error');
            }
        });
    });
}

// Helper functions for status and priority labels
function getStatusLabel(status) {
    const statusLabels = {
        'not-started': 'Not Started',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    };
    return statusLabels[status] || status;
}

function getPriorityLabel(priority) {
    const priorityLabels = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High'
    };
    return priorityLabels[priority] || priority;
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Function to fetch tasks from API
async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showNotification('Failed to load tasks', 'error');
        return [];
    }
}

// Function to fetch a task by ID
async function fetchTaskById(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch task');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching task:', error);
        showNotification('Failed to load task details', 'error');
        return null;
    }
}

// Function to fetch a project by ID
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

// Function to get all projects
async function fetchAllProjects() {
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

// Function to generate HTML for project options
async function getProjectOptionsHTML(selectedProjectId) {
    const projects = await fetchAllProjects();
    if (projects.length === 0) {
        return '<option value="">No projects available</option>';
    }

    return projects.map(project =>
        `<option value="${project._id}" ${project._id === selectedProjectId ? 'selected' : ''}>${project.name}</option>`
    ).join('');
}

// Function to fetch all team members
async function fetchTeamMembers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Failed to fetch team members');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching team members:', error);
        return [];
    }
}

// Function to open task modal (add or edit)
async function openTaskModal(mode, projectId, taskId = null, milestoneId = null) {
    try {
        // Get project
        const project = await fetchProjectById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        // Create modal HTML
        let task = null;
        let modalTitle = 'Add New Task';
        let submitButtonText = 'Create Task';
        let milestone = null;

        if (mode === 'edit' && taskId) {
            task = await fetchTaskById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            modalTitle = 'Edit Task';
            submitButtonText = 'Update Task';

            // Get milestone from task if it exists
            if (task.milestoneId) {
                milestoneId = task.milestoneId._id || task.milestoneId;
            }
        }

        // Fetch milestone if milestoneId is provided
        if (milestoneId) {
            try {
                const response = await fetch(`/api/milestones/${milestoneId}`);
                if (response.ok) {
                    milestone = await response.json();
                    // Verify milestone belongs to the selected project
                    if (milestone.projectId._id !== projectId) {
                        console.warn('Milestone does not belong to the selected project');
                        milestone = null;
                        milestoneId = null;
                    }
                }
            } catch (error) {
                console.error('Error fetching milestone:', error);
                milestone = null;
                milestoneId = null;
            }
        }

        // Get team members
        const teamMembers = await fetchTeamMembers();

        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="task-modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>${modalTitle}</h3>
                        <button type="button" class="close-modal" id="close-task-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="task-form">
                            <input type="hidden" id="task-id" name="taskId" value="${task ? task._id : ''}">
                            <input type="hidden" id="task-project-id" name="projectId" value="${projectId}">
                            <input type="hidden" id="task-milestone-id" name="milestoneId" value="${milestoneId || ''}">
                            <div class="form-group">
                                <label for="task-project">Project</label>
                                <select id="task-project" name="projectId" required>
                                    ${await getProjectOptionsHTML(projectId)}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="task-milestone">Milestone (Optional)</label>
                                <select id="task-milestone" name="milestoneId">
                                    <option value="">No Milestone</option>
                                    ${milestone ? `<option value="${milestone._id}" selected>${milestone.name}</option>` : ''}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="task-name">Task Name</label>
                                <input type="text" id="task-name" name="name" required value="${task ? task.name : ''}">
                            </div>
                            <div class="form-group">
                                <label for="task-description">Description (Optional)</label>
                                <textarea id="task-description" name="description" rows="3" placeholder="Leave empty for no description">${task ? task.description : ''}</textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="task-start-date">Start Date</label>
                                    <input type="date" id="task-start-date" name="startDate" required value="${task ? task.startDate.substring(0, 10) : new Date().toISOString().substring(0, 10)}">
                                </div>
                                <div class="form-group">
                                    <label for="task-due-date">Due Date</label>
                                    <input type="date" id="task-due-date" name="dueDate" required value="${task ? task.dueDate.substring(0, 10) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="task-status">Status</label>
                                    <select id="task-status" name="status">
                                        <option value="not-started" ${task && task.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                                        <option value="in-progress" ${task && task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                        <option value="completed" ${task && task.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="task-priority">Priority</label>
                                    <select id="task-priority" name="priority">
                                        <option value="low" ${task && task.priority === 'low' ? 'selected' : ''}>Low</option>
                                        <option value="medium" ${task && task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                        <option value="high" ${task && task.priority === 'high' ? 'selected' : ''}>High</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="task-progress">Progress: <span id="progress-value">${task ? task.progress : 0}%</span></label>
                                <input type="range" id="task-progress" name="progress" min="0" max="100" value="${task ? task.progress : 0}">
                            </div>
                            <div class="form-group">
                                <label>Assigned To</label>
                                <div class="assignee-selection">
                                    ${teamMembers.map(member => `
                                        <div class="assignee-option">
                                            <input type="checkbox" id="assignee-${member._id}" name="assignedTo" value="${member._id}" ${task && task.assignedTo && task.assignedTo.some(a => a._id === member._id) ? 'checked' : ''}>
                                            <label for="assignee-${member._id}">
                                                <div class="assignee-avatar">
                                                    <img src="${member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}" alt="${member.name}">
                                                </div>
                                                <span>${member.name}</span>
                                            </label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancel-task">Cancel</button>
                                <button type="submit" class="btn-primary">${submitButtonText}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        document.getElementById('close-task-modal').addEventListener('click', closeTaskModal);
        document.getElementById('cancel-task').addEventListener('click', closeTaskModal);
        document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);

        // Update progress value display when slider changes
        const progressSlider = document.getElementById('task-progress');
        const progressValue = document.getElementById('progress-value');
        progressSlider.addEventListener('input', () => {
            progressValue.textContent = `${progressSlider.value}%`;
        });

        // Add event listener for project selection change
        document.getElementById('task-project').addEventListener('change', async function() {
            const selectedProjectId = this.value;
            if (selectedProjectId) {
                try {
                    // Update the hidden project ID field
                    document.getElementById('task-project-id').value = selectedProjectId;

                    // Fetch the project details to update team members
                    const project = await fetchProjectById(selectedProjectId);
                    if (project && project.teamMembers) {
                        // Update team members selection if needed
                        // This would be implemented in a more complex version
                    }

                    // Update milestone dropdown with milestones for this project
                    await updateMilestoneDropdown(selectedProjectId);
                } catch (error) {
                    console.error('Error updating project selection:', error);
                }
            }
        });

        // Load milestones for the selected project
        await updateMilestoneDropdown(projectId, milestoneId);

        // Add fade-in animation
        setTimeout(() => {
            document.getElementById('task-modal-overlay').classList.add('active');
        }, 10);
    } catch (error) {
        console.error('Error opening task modal:', error);
        showNotification('Failed to open task form', 'error');
    }
}

// Function to close task modal
function closeTaskModal() {
    const modalOverlay = document.getElementById('task-modal-overlay');
    modalOverlay.classList.add('fade-out');
    setTimeout(() => {
        modalOverlay.remove();
    }, 300);
}

// Function to update milestone dropdown based on selected project
async function updateMilestoneDropdown(projectId, selectedMilestoneId = null) {
    try {
        const milestoneDropdown = document.getElementById('task-milestone');
        if (!milestoneDropdown) return;

        // Clear existing options except the first one (No Milestone)
        while (milestoneDropdown.options.length > 1) {
            milestoneDropdown.remove(1);
        }

        // Fetch milestones for the selected project
        const response = await fetch(`/api/milestones?projectId=${projectId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch milestones');
        }

        const milestones = await response.json();

        // Add milestone options
        milestones.forEach(milestone => {
            const option = document.createElement('option');
            option.value = milestone._id;
            option.textContent = milestone.name;

            // Select the milestone if it matches the selected milestone ID
            if (selectedMilestoneId && milestone._id === selectedMilestoneId) {
                option.selected = true;
            }

            milestoneDropdown.appendChild(option);
        });

        // Update the hidden milestone ID field
        const milestoneIdField = document.getElementById('task-milestone-id');
        if (milestoneIdField) {
            milestoneIdField.value = milestoneDropdown.value;
        }

        // Add event listener to update hidden field when selection changes
        milestoneDropdown.addEventListener('change', function() {
            const milestoneIdField = document.getElementById('task-milestone-id');
            if (milestoneIdField) {
                milestoneIdField.value = this.value;
            }
        });
    } catch (error) {
        console.error('Error updating milestone dropdown:', error);
    }
}

// Function to handle task form submission
async function handleTaskSubmit(event) {
    event.preventDefault();

    try {
        const form = event.target;
        const formData = new FormData(form);

        const taskId = formData.get('taskId');
        const projectId = document.getElementById('task-project').value; // Get the selected project from the dropdown
        const milestoneId = document.getElementById('task-milestone').value; // Get the selected milestone

        // Validate project selection
        if (!projectId) {
            showNotification('Please select a project for this task', 'error');
            return;
        }

        // Log the selected project ID for debugging
        console.log('Selected Project ID:', projectId);
        console.log('Selected Milestone ID:', milestoneId);

        // Get all selected assignees
        const assignedToElements = form.querySelectorAll('input[name="assignedTo"]:checked');
        const assignedTo = Array.from(assignedToElements).map(el => el.value);

        // Create task data object
        const taskData = {
            projectId: projectId,
            milestoneId: milestoneId || null, // Include milestone ID if selected
            name: formData.get('name'),
            description: formData.get('description'),
            startDate: formData.get('startDate'),
            dueDate: formData.get('dueDate'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            progress: parseInt(formData.get('progress')),
            assignedTo: assignedTo
        };

        let response;

        if (taskId) {
            // Update existing task
            response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
        } else {
            // Create new task
            response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
        }

        if (!response.ok) {
            throw new Error(`Failed to ${taskId ? 'update' : 'create'} task`);
        }

        // Close modal
        closeTaskModal();

        // Show success message
        showNotification(`Task ${taskId ? 'updated' : 'created'} successfully`, 'success');

        // Reload tasks
        loadAllTasks();
        loadTaskAnalytics();
    } catch (error) {
        console.error('Error saving task:', error);
        showNotification(`Failed to save task: ${error.message}`, 'error');
    }
}

function setupTasksPageEventListeners() {
    // Filter change events
    document.getElementById('project-filter').addEventListener('change', loadAllTasks);
    document.getElementById('status-filter').addEventListener('change', loadAllTasks);
    document.getElementById('priority-filter').addEventListener('change', loadAllTasks);
    document.getElementById('assignee-filter').addEventListener('change', loadAllTasks);

    // Search input
    document.getElementById('task-search').addEventListener('input', loadAllTasks);

    // Sort and group options
    document.getElementById('sort-by').addEventListener('change', loadAllTasks);
    document.getElementById('group-by').addEventListener('change', loadAllTasks);

    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all view buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            // Show the selected view
            const viewType = this.dataset.view;
            document.querySelectorAll('.task-view').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById(`${viewType}-view`).classList.add('active');

            // Reload tasks for the selected view
            loadAllTasks();
        });
    });

    // New task button
    document.querySelector('.new-task-btn').addEventListener('click', async function() {
        // Get the selected project from the filter
        const projectFilter = document.getElementById('project-filter');
        let selectedProjectId;

        if (projectFilter.value !== 'all') {
            selectedProjectId = projectFilter.value;
        } else {
            // Get the first project if no project is selected
            try {
                const response = await fetch('/api/projects');
                if (!response.ok) throw new Error('Failed to fetch projects');
                const projects = await response.json();
                if (projects.length > 0) {
                    selectedProjectId = projects[0]._id;
                } else {
                    showNotification('Please create a project first', 'warning');
                    return;
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                showNotification('Failed to load projects', 'error');
                return;
            }
        }

        openTaskModal('add', selectedProjectId);
    });
}
