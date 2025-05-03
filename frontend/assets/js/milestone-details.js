// Milestone Details Page JavaScript

// Global variables
let currentMilestone = null;
let relatedTasks = [];

// Initialize the milestone details page
async function initMilestoneDetailsPage() {
    try {
        // Show loading overlay
        showLoadingOverlay('Loading milestone details...');

        // Get milestone ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const milestoneId = urlParams.get('id');

        if (!milestoneId) {
            // No milestone ID provided, redirect to milestones page
            showNotification('No milestone selected', 'error');
            window.location.href = 'milestones.html';
            return;
        }

        // Fetch milestone details
        currentMilestone = await fetchMilestoneById(milestoneId);

        if (!currentMilestone) {
            // Milestone not found
            showNotification('Milestone not found', 'error');
            window.location.href = 'milestones.html';
            return;
        }

        // Update page title
        document.title = `${currentMilestone.name} - Milestone Details - Planr`;

        // Populate milestone details
        populateMilestoneDetails(currentMilestone);

        // Fetch related tasks
        await loadRelatedTasks(currentMilestone.projectId);

        // Generate activity timeline
        generateActivityTimeline(currentMilestone);

        // Setup event listeners
        setupEventListeners(currentMilestone);

        // Hide loading overlay
        hideLoadingOverlay();
    } catch (error) {
        console.error('Error initializing milestone details page:', error);
        showNotification('Failed to load milestone details', 'error');
        hideLoadingOverlay();
    }
}

// Populate milestone details in the UI
function populateMilestoneDetails(milestone) {
    // Set milestone name
    document.getElementById('milestone-name').textContent = milestone.name;

    // Set milestone status
    const statusElement = document.getElementById('milestone-status');
    statusElement.textContent = getStatusLabel(milestone.status);
    statusElement.className = `milestone-status ${milestone.status}`;

    // Set project name
    const projectElement = document.getElementById('milestone-project');
    if (milestone.projectId && typeof milestone.projectId === 'object') {
        projectElement.textContent = milestone.projectId.name;
        projectElement.href = `projects.html?id=${milestone.projectId._id}`;
    } else {
        // If projectId is not populated, fetch project details
        fetchProjectById(milestone.projectId)
            .then(project => {
                if (project) {
                    projectElement.textContent = project.name;
                    projectElement.href = `projects.html?id=${project._id}`;
                } else {
                    projectElement.textContent = 'Unknown Project';
                    projectElement.removeAttribute('href');
                }
            })
            .catch(error => {
                console.error('Error fetching project details:', error);
                projectElement.textContent = 'Unknown Project';
                projectElement.removeAttribute('href');
            });
    }

    // Set due date
    document.getElementById('milestone-due-date').textContent = formatDate(milestone.dueDate);

    // Set created by
    const createdByElement = document.getElementById('milestone-created-by');
    if (milestone.createdBy && typeof milestone.createdBy === 'object') {
        createdByElement.textContent = milestone.createdBy.name;
    } else {
        // If createdBy is not populated, show 'Unknown User'
        createdByElement.textContent = 'Unknown User';
    }

    // Set created at
    document.getElementById('milestone-created-at').textContent = formatDate(milestone.createdAt);

    // Set progress
    document.getElementById('milestone-progress-percentage').textContent = `${milestone.progress}%`;
    document.getElementById('milestone-progress-fill').style.width = `${milestone.progress}%`;

    // Set description
    document.getElementById('milestone-description').textContent = milestone.description || 'No description provided.';

    // Set deliverables
    const deliverablesElement = document.getElementById('milestone-deliverables');
    if (milestone.deliverables && milestone.deliverables.length > 0) {
        deliverablesElement.innerHTML = milestone.deliverables
            .map(deliverable => `<li>${deliverable}</li>`)
            .join('');
    } else {
        deliverablesElement.innerHTML = '<li>No deliverables specified.</li>';
    }
}

// Load tasks related to the milestone
async function loadRelatedTasks(projectId) {
    try {
        // Show loading indicator
        document.querySelector('.loading-tasks').classList.remove('hidden');
        document.getElementById('no-tasks-message').classList.add('hidden');
        document.getElementById('task-list').classList.add('hidden');

        // Fetch tasks for the milestone
        const milestoneId = currentMilestone._id;
        const milestoneTasks = await fetchTasksByMilestone(milestoneId);

        // Fetch other project tasks that are not associated with any milestone
        const projectTasks = await fetchTasksByProject(projectId);
        const unassignedTasks = projectTasks.filter(task => !task.milestoneId);

        // Combine tasks
        relatedTasks = [...milestoneTasks, ...unassignedTasks];

        // Update UI
        const taskListElement = document.getElementById('task-list');

        if (milestoneTasks.length === 0) {
            // No tasks found for this milestone
            if (unassignedTasks.length === 0) {
                // No unassigned tasks either
                document.querySelector('.loading-tasks').classList.add('hidden');
                document.getElementById('no-tasks-message').classList.remove('hidden');
                return;
            } else {
                // Show a message about no milestone tasks but show unassigned tasks
                const milestoneTasksHeader = document.createElement('div');
                milestoneTasksHeader.className = 'task-section-header';
                milestoneTasksHeader.innerHTML = `
                    <h4>No tasks assigned to this milestone</h4>
                    <p>You can assign tasks from the list below or create a new task.</p>
                `;
                taskListElement.appendChild(milestoneTasksHeader);
            }
        } else {
            // Show milestone tasks with header
            const milestoneTasksHeader = document.createElement('div');
            milestoneTasksHeader.className = 'task-section-header';
            milestoneTasksHeader.innerHTML = `
                <h4>Tasks in this milestone (${milestoneTasks.length})</h4>
            `;
            taskListElement.appendChild(milestoneTasksHeader);

            // Add milestone tasks
            milestoneTasks.forEach(task => {
                const taskItem = createTaskItemHTML(task, true);
                taskListElement.appendChild(taskItem);
            });
        }

        // Show unassigned tasks with header if there are any
        if (unassignedTasks.length > 0) {
            const unassignedTasksHeader = document.createElement('div');
            unassignedTasksHeader.className = 'task-section-header';
            unassignedTasksHeader.innerHTML = `
                <h4>Unassigned project tasks (${unassignedTasks.length})</h4>
                <p>You can assign these tasks to this milestone.</p>
            `;
            taskListElement.appendChild(unassignedTasksHeader);

            // Add unassigned tasks
            unassignedTasks.forEach(task => {
                const taskItem = createTaskItemHTML(task, false);
                taskListElement.appendChild(taskItem);
            });
        }

        // Hide loading indicator and show task list
        document.querySelector('.loading-tasks').classList.add('hidden');
        taskListElement.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading related tasks:', error);
        document.querySelector('.loading-tasks').classList.add('hidden');
        document.getElementById('no-tasks-message').classList.remove('hidden');
    }
}

// Create HTML for a task item
function createTaskItemHTML(task, isAssigned = false) {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

    return `
        <li class="task-item ${isAssigned ? 'assigned' : 'unassigned'}" data-task-id="${task._id}">
            <div class="task-checkbox">
                <input type="checkbox" id="task-${task._id}" ${task.status === 'completed' ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <h5>${task.name}</h5>
                <p>${task.description || 'No description provided.'}</p>
                <div class="task-meta">
                    <span class="task-status status-${task.status}">${getStatusLabel(task.status)}</span>
                    <span class="task-priority priority-${task.priority}">Priority: ${getPriorityLabel(task.priority)}</span>
                    <span class="task-due ${isOverdue ? 'overdue' : ''}">Due: ${formatDate(task.dueDate)}${isOverdue ? ' (Overdue)' : ''}</span>
                </div>
            </div>
            <div class="task-actions">
                ${isAssigned ?
                    `<button type="button" class="task-unassign-btn" title="Remove from milestone">
                        <i class="fas fa-unlink"></i>
                    </button>` :
                    `<button type="button" class="task-assign-btn" title="Assign to milestone">
                        <i class="fas fa-link"></i>
                    </button>`
                }
                <button type="button" class="task-edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </li>
    `;
}

// Generate activity timeline for the milestone
function generateActivityTimeline(milestone) {
    try {
        // Show loading indicator
        document.querySelector('.loading-timeline').classList.remove('hidden');
        document.getElementById('no-activity-message').classList.add('hidden');
        document.getElementById('timeline-list').classList.add('hidden');

        // Create timeline items
        const timelineItems = [];

        // Add creation event
        timelineItems.push({
            type: 'created',
            date: milestone.createdAt,
            content: `<strong>${milestone.createdBy?.name || 'Unknown User'}</strong> created this milestone`
        });

        // Add update event if available
        if (milestone.updatedAt && milestone.updatedAt !== milestone.createdAt) {
            timelineItems.push({
                type: 'updated',
                date: milestone.updatedAt,
                content: `<strong>${milestone.createdBy?.name || 'Unknown User'}</strong> updated this milestone`
            });
        }

        // Sort timeline items by date (newest first)
        timelineItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Update UI
        const timelineListElement = document.getElementById('timeline-list');

        if (timelineItems.length === 0) {
            // No activity found
            document.querySelector('.loading-timeline').classList.add('hidden');
            document.getElementById('no-activity-message').classList.remove('hidden');
            return;
        }

        // Render timeline
        timelineListElement.innerHTML = timelineItems
            .map(item => `
                <li class="timeline-item ${item.type}">
                    <div class="timeline-content">
                        ${item.content}
                        <span class="timeline-date">${formatDateTime(item.date)}</span>
                    </div>
                </li>
            `)
            .join('');

        // Hide loading indicator and show timeline
        document.querySelector('.loading-timeline').classList.add('hidden');
        timelineListElement.classList.remove('hidden');
    } catch (error) {
        console.error('Error generating activity timeline:', error);
        document.querySelector('.loading-timeline').classList.add('hidden');
        document.getElementById('no-activity-message').classList.remove('hidden');
    }
}

// Setup event listeners
function setupEventListeners(milestone) {
    // Edit milestone button
    const editButton = document.getElementById('edit-milestone-btn');
    if (editButton) {
        editButton.addEventListener('click', () => {
            // Redirect to milestones page with edit modal
            window.location.href = `milestones.html?edit=${milestone._id}`;
        });
    }

    // Delete milestone button
    const deleteButton = document.getElementById('delete-milestone-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            confirmDeleteMilestone(milestone._id);
        });
    }

    // Add links to the milestone timeline and reports pages
    const timelineLink = document.createElement('a');
    timelineLink.href = 'milestone-timeline.html';
    timelineLink.className = 'view-timeline-link';
    timelineLink.innerHTML = '<i class="fas fa-calendar-alt"></i> View Timeline';
    document.querySelector('.milestone-details-actions').appendChild(timelineLink);

    const reportsLink = document.createElement('a');
    reportsLink.href = 'milestone-reports.html';
    reportsLink.className = 'view-reports-link';
    reportsLink.innerHTML = '<i class="fas fa-chart-bar"></i> View Reports';
    document.querySelector('.milestone-details-actions').appendChild(reportsLink);

    // Add task button
    const addTaskButton = document.getElementById('add-task-btn');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', () => {
            // Redirect to tasks page with new task modal and pre-filled milestone
            window.location.href = `tasks.html?new=true&project=${milestone.projectId}&milestone=${milestone._id}`;
        });
    }

    // Task checkboxes
    document.addEventListener('change', async (event) => {
        if (event.target.type === 'checkbox' && event.target.id.startsWith('task-')) {
            const taskId = event.target.id.replace('task-', '');
            const isChecked = event.target.checked;

            try {
                // Find the task
                const task = relatedTasks.find(t => t._id === taskId);
                if (!task) return;

                // Update task status
                const updatedTask = await updateTaskStatus(
                    taskId,
                    isChecked ? 'completed' : 'in-progress',
                    isChecked ? 100 : task.progress
                );

                if (updatedTask) {
                    // Update the task in the list
                    const taskIndex = relatedTasks.findIndex(t => t._id === taskId);
                    if (taskIndex !== -1) {
                        relatedTasks[taskIndex] = updatedTask;
                    }

                    // Update the task item in the UI
                    const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
                    if (taskItem) {
                        taskItem.outerHTML = createTaskItemHTML(updatedTask);
                    }

                    showNotification('Task status updated', 'success');
                }
            } catch (error) {
                console.error('Error updating task status:', error);
                showNotification('Failed to update task status', 'error');
                // Revert checkbox state
                event.target.checked = !isChecked;
            }
        }
    });

    // Task item click for viewing details
    document.addEventListener('click', (event) => {
        const taskItem = event.target.closest('.task-item');
        if (taskItem && !event.target.closest('.task-checkbox') &&
            !event.target.closest('.task-actions')) {
            const taskId = taskItem.dataset.taskId;
            // Redirect to tasks page with task details
            window.location.href = `tasks.html?id=${taskId}`;
        }
    });

    // Task assign button click
    document.addEventListener('click', async (event) => {
        const assignBtn = event.target.closest('.task-assign-btn');
        if (assignBtn) {
            const taskItem = assignBtn.closest('.task-item');
            const taskId = taskItem.dataset.taskId;

            try {
                // Update task to assign it to this milestone
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        milestoneId: currentMilestone._id
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to assign task to milestone');
                }

                showNotification('Task assigned to milestone', 'success');

                // Reload tasks to reflect changes
                await loadRelatedTasks(currentMilestone.projectId);
            } catch (error) {
                console.error('Error assigning task to milestone:', error);
                showNotification('Failed to assign task to milestone', 'error');
            }
        }
    });

    // Task unassign button click
    document.addEventListener('click', async (event) => {
        const unassignBtn = event.target.closest('.task-unassign-btn');
        if (unassignBtn) {
            const taskItem = unassignBtn.closest('.task-item');
            const taskId = taskItem.dataset.taskId;

            try {
                // Update task to remove milestone association
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        milestoneId: 'null' // Special value to remove milestone
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to remove task from milestone');
                }

                showNotification('Task removed from milestone', 'success');

                // Reload tasks to reflect changes
                await loadRelatedTasks(currentMilestone.projectId);
            } catch (error) {
                console.error('Error removing task from milestone:', error);
                showNotification('Failed to remove task from milestone', 'error');
            }
        }
    });

    // Task edit button click
    document.addEventListener('click', (event) => {
        const editBtn = event.target.closest('.task-edit-btn');
        if (editBtn) {
            const taskItem = editBtn.closest('.task-item');
            const taskId = taskItem.dataset.taskId;
            // Redirect to tasks page with edit modal
            window.location.href = `tasks.html?edit=${taskId}`;
        }
    });
}

// Confirm delete milestone
function confirmDeleteMilestone(milestoneId) {
    // Create confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirmation-dialog';
    confirmDialog.innerHTML = `
        <div class="confirmation-content">
            <h3>Delete Milestone</h3>
            <p>Are you sure you want to delete this milestone? This action cannot be undone.</p>
            <div class="confirmation-actions">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="button" class="confirm-btn">Delete</button>
            </div>
        </div>
    `;

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'confirmation-backdrop';

    // Add to document
    document.body.appendChild(backdrop);
    document.body.appendChild(confirmDialog);

    // Show with animation
    setTimeout(() => {
        confirmDialog.classList.add('show');
        backdrop.classList.add('show');
    }, 10);

    // Handle cancel button
    const cancelButton = confirmDialog.querySelector('.cancel-btn');
    cancelButton.addEventListener('click', () => {
        confirmDialog.classList.remove('show');
        backdrop.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(confirmDialog);
            document.body.removeChild(backdrop);
        }, 300);
    });

    // Handle confirm button
    const confirmButton = confirmDialog.querySelector('.confirm-btn');
    confirmButton.addEventListener('click', async () => {
        try {
            // Delete milestone
            const result = await deleteMilestone(milestoneId);

            if (result) {
                showNotification('Milestone deleted successfully', 'success');
                // Redirect to milestones page
                window.location.href = 'milestones.html';
            } else {
                throw new Error('Failed to delete milestone');
            }
        } catch (error) {
            console.error('Error deleting milestone:', error);
            showNotification('Failed to delete milestone', 'error');

            // Close dialog
            confirmDialog.classList.remove('show');
            backdrop.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(confirmDialog);
                document.body.removeChild(backdrop);
            }, 300);
        }
    });
}

// Update task status
async function updateTaskStatus(taskId, status, progress) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, progress })
        });

        if (!response.ok) {
            throw new Error('Failed to update task status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
    }
}

// Fetch tasks by project
async function fetchTasksByProject(projectId) {
    try {
        const response = await fetch(`/api/tasks?projectId=${projectId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

// Fetch tasks by milestone
async function fetchTasksByMilestone(milestoneId) {
    try {
        const response = await fetch(`/api/tasks/milestone/${milestoneId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch milestone tasks');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching milestone tasks:', error);
        return [];
    }
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
        default:
            return status;
    }
}

// Helper function to get priority label
function getPriorityLabel(priority) {
    switch (priority) {
        case 'low':
            return 'Low';
        case 'medium':
            return 'Medium';
        case 'high':
            return 'High';
        default:
            return priority;
    }
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Helper function to format date and time
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show loading overlay
function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay.querySelector('.loading-text');

    loadingText.textContent = message;
    overlay.style.display = 'flex';

    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');

    overlay.classList.remove('active');

    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}
