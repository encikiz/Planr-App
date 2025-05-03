// Task management functionality
// IMPORTANT: This file has been updated to use API endpoints instead of sample data

// Function to get all tasks for a project
async function getProjectTasks(projectId) {
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

// Function to get a specific task
async function getTask(taskId) {
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

// Function to get team member by ID
async function getTeamMember(memberId) {
    try {
        const response = await fetch(`/api/users/${memberId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch team member');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching team member:', error);
        return {
            name: 'Unassigned',
            avatar: 'https://ui-avatars.com/api/?name=Unassigned&background=cccccc&color=fff'
        };
    }
}

// Function to open task modal (add or edit)
async function openTaskModal(mode, projectId, taskId = null) {
    try {
        // Get project
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch project');
        }
        const project = await response.json();
        if (!project) {
            showNotification('Project not found', 'error');
            return;
        }

        // Create modal HTML
        let task = null;
        let modalTitle = 'Add New Task';
        let submitButtonText = 'Create Task';

        if (mode === 'edit' && taskId) {
            const taskResponse = await fetch(`/api/tasks/${taskId}`);
            if (!taskResponse.ok) {
                throw new Error('Failed to fetch task');
            }
            task = await taskResponse.json();
            if (!task) {
                showNotification('Task not found', 'error');
                return;
            }
            modalTitle = 'Edit Task';
            submitButtonText = 'Update Task';
        }

        // Get team members for the project
        const teamResponse = await fetch('/api/users');
        if (!teamResponse.ok) {
            throw new Error('Failed to fetch team members');
        }
        const allTeamMembers = await teamResponse.json();
        const teamMembers = allTeamMembers;

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
                        <div class="form-group">
                            <label for="task-name">Task Name</label>
                            <input type="text" id="task-name" name="name" required value="${task ? task.name : ''}">
                        </div>
                        <div class="form-group">
                            <label for="task-description">Description</label>
                            <textarea id="task-description" name="description" rows="3">${task ? task.description : ''}</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="task-start-date">Start Date</label>
                                <input type="date" id="task-start-date" name="startDate" required value="${task ? task.startDate : ''}">
                            </div>
                            <div class="form-group">
                                <label for="task-due-date">Due Date</label>
                                <input type="date" id="task-due-date" name="dueDate" required value="${task ? task.dueDate : ''}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="task-status">Status</label>
                                <select id="task-status" name="status" required>
                                    <option value="not-started" ${task && task.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                                    <option value="in-progress" ${task && task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="completed" ${task && task.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="task-priority">Priority</label>
                                <select id="task-priority" name="priority" required>
                                    <option value="low" ${task && task.priority === 'low' ? 'selected' : ''}>Low</option>
                                    <option value="medium" ${task && task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="high" ${task && task.priority === 'high' ? 'selected' : ''}>High</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="task-progress">Progress</label>
                            <div class="progress-container">
                                <input type="range" id="task-progress" name="progress" min="0" max="100" step="5" value="${task ? task.progress : '0'}">
                                <span id="progress-value">${task ? task.progress : '0'}%</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Assign To</label>
                            <div class="team-members-selection">
                                ${teamMembers.map(member => `
                                    <div class="team-member-checkbox">
                                        <input type="checkbox" id="member-${member.id}" name="assignedTo" value="${member.id}"
                                            ${task && task.assignedTo && task.assignedTo.includes(member.id) ? 'checked' : ''}>
                                        <label for="member-${member.id}">
                                            <div class="avatar">
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
    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask(projectId, taskId);
    });

    // Update progress value display when slider changes
    const progressSlider = document.getElementById('task-progress');
    const progressValue = document.getElementById('progress-value');
    progressSlider.addEventListener('input', () => {
        progressValue.textContent = `${progressSlider.value}%`;
    });

    // Add fade-in animation
    setTimeout(() => {
        document.getElementById('task-modal-overlay').classList.add('active');
    }, 10);
    } catch (error) {
        console.error('Error opening task modal:', error);
        showNotification('Failed to open task modal', 'error');
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

// Function to save task (create or update)
async function saveTask(projectId, taskId = null) {
    try {
        // Get form values
        const name = document.getElementById('task-name').value;
        const description = document.getElementById('task-description').value;
        const startDate = document.getElementById('task-start-date').value;
        const dueDate = document.getElementById('task-due-date').value;
        const status = document.getElementById('task-status').value;
        const priority = document.getElementById('task-priority').value;
        const progress = parseInt(document.getElementById('task-progress').value);

        // Get assigned team members
        const assignedToCheckboxes = document.querySelectorAll('input[name="assignedTo"]:checked');
        const assignedTo = Array.from(assignedToCheckboxes).map(checkbox => checkbox.value);

        // Create task data object
        const taskData = {
            projectId: projectId,
            name,
            description,
            assignedTo,
            status,
            progress,
            priority,
            startDate,
            dueDate
        };

        // Show loading state
        const submitBtn = document.querySelector('#task-form button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

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

        // Reload tasks
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (!projectResponse.ok) {
            throw new Error('Failed to fetch project');
        }
        const project = await projectResponse.json();
        await loadProjectTasks(project);

        // Show success message
        showNotification(taskId ? 'Task updated successfully' : 'Task created successfully', 'success');
    } catch (error) {
        console.error('Error saving task:', error);
        showNotification('Failed to save task', 'error');

        // Reset button state
        const submitBtn = document.querySelector('#task-form button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = taskId ? 'Update Task' : 'Create Task';
    }
}

// Function to confirm delete task
async function confirmDeleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        // Get task to find project ID
        const taskResponse = await fetch(`/api/tasks/${taskId}`);
        if (!taskResponse.ok) {
            throw new Error('Failed to fetch task');
        }
        const task = await taskResponse.json();
        if (!task) {
            showNotification('Task not found', 'error');
            return;
        }

        // Get project ID
        const projectId = task.projectId;

        // Delete task
        const deleteResponse = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) {
            throw new Error('Failed to delete task');
        }

        // Get project
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (!projectResponse.ok) {
            throw new Error('Failed to fetch project');
        }
        const project = await projectResponse.json();

        // Reload tasks
        await loadProjectTasks(project);

        // Show success message
        showNotification('Task deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task', 'error');
    }
}

// Using the global showNotification function from notification.js

// Function to update task rendering in projects.js
function updateTaskRendering() {
    // This function will be called from projects.js to update the task rendering
    // to support multiple assignees
}
