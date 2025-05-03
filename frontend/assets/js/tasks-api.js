// Task API functions

// Function to fetch all tasks
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

// Function to create a new task
async function createTask(taskData) {
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        
        const newTask = await response.json();
        showNotification('Task created successfully', 'success');
        return newTask;
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Failed to create task', 'error');
        return null;
    }
}

// Function to update a task
async function updateTask(taskId, taskData) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        const updatedTask = await response.json();
        showNotification('Task updated successfully', 'success');
        return updatedTask;
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Failed to update task', 'error');
        return null;
    }
}

// Function to delete a task
async function deleteTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        showNotification('Task deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task', 'error');
        return false;
    }
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
async function openTaskModal(mode, projectId, taskId = null) {
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

        if (mode === 'edit' && taskId) {
            task = await fetchTaskById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            modalTitle = 'Edit Task';
            submitButtonText = 'Update Task';
        }

        // Get team members
        const teamMembers = await fetchTeamMembers();

        // Create modal if it doesn't exist
        let modal = document.getElementById('task-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'task-modal';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="task-modal-title">${modalTitle}</h3>
                        <button type="button" class="close-modal" id="close-task-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="task-form">
                            <input type="hidden" id="task-id" name="taskId" value="${task ? task._id : ''}">
                            <input type="hidden" id="task-project-id" name="projectId" value="${projectId}">
                            <div class="form-group">
                                <label for="task-name">Task Name</label>
                                <input type="text" id="task-name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="task-description">Description</label>
                                <textarea id="task-description" name="description" rows="3" required></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label for="task-start-date">Start Date</label>
                                    <input type="date" id="task-start-date" name="startDate" required>
                                </div>
                                <div class="form-group half">
                                    <label for="task-due-date">Due Date</label>
                                    <input type="date" id="task-due-date" name="dueDate" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label for="task-status">Status</label>
                                    <select id="task-status" name="status" required>
                                        <option value="not-started">Not Started</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div class="form-group half">
                                    <label for="task-priority">Priority</label>
                                    <select id="task-priority" name="priority" required>
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="task-progress">Progress</label>
                                <div class="progress-slider-container">
                                    <input type="range" id="task-progress" name="progress" min="0" max="100" step="5" value="0">
                                    <span id="task-progress-value">0%</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Assign To</label>
                                <div class="team-selection" id="task-team-selection">
                                    <p>Team member selection will be implemented in the next phase</p>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="cancel-btn" id="cancel-task">Cancel</button>
                                <button type="submit" class="submit-btn" id="submit-task">${submitButtonText}</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            document.getElementById('close-task-modal').addEventListener('click', closeTaskModal);
            document.getElementById('cancel-task').addEventListener('click', closeTaskModal);
            document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);
            
            // Add progress slider event listener
            const progressSlider = document.getElementById('task-progress');
            const progressValue = document.getElementById('task-progress-value');
            
            progressSlider.addEventListener('input', function() {
                progressValue.textContent = this.value + '%';
            });
        } else {
            // Update modal title
            document.getElementById('task-modal-title').textContent = modalTitle;
            document.getElementById('submit-task').textContent = submitButtonText;
            
            // Reset form
            document.getElementById('task-id').value = task ? task._id : '';
            document.getElementById('task-project-id').value = projectId;
        }
        
        // Fill the form with task data if editing
        if (task) {
            document.getElementById('task-name').value = task.name;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-start-date').value = formatDateForInput(task.startDate);
            document.getElementById('task-due-date').value = formatDateForInput(task.dueDate);
            document.getElementById('task-status').value = task.status;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-progress').value = task.progress;
            document.getElementById('task-progress-value').textContent = task.progress + '%';
        } else {
            // Set default values for new task
            const today = new Date();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // Default due date is 1 week from now
            
            document.getElementById('task-name').value = '';
            document.getElementById('task-description').value = '';
            document.getElementById('task-start-date').value = formatDateForInput(today);
            document.getElementById('task-due-date').value = formatDateForInput(dueDate);
            document.getElementById('task-status').value = 'not-started';
            document.getElementById('task-priority').value = 'medium';
            document.getElementById('task-progress').value = 0;
            document.getElementById('task-progress-value').textContent = '0%';
        }
        
        // Show the modal
        modal.classList.add('active');
    } catch (error) {
        console.error('Error opening task modal:', error);
        showNotification('Failed to open task form', 'error');
    }
}

// Function to close task modal
function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Function to handle task form submission
async function handleTaskSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const taskId = formData.get('taskId');
    const projectId = formData.get('projectId');
    
    // Create task data object
    const taskData = {
        projectId: projectId,
        name: formData.get('name'),
        description: formData.get('description'),
        startDate: formData.get('startDate'),
        dueDate: formData.get('dueDate'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        progress: parseInt(formData.get('progress')),
        assignedTo: [] // Will be implemented in the next phase
    };
    
    try {
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        let result;
        
        if (taskId) {
            // Update existing task
            result = await updateTask(taskId, taskData);
        } else {
            // Create new task
            result = await createTask(taskData);
        }
        
        if (result) {
            // Close the modal
            closeTaskModal();
            
            // Reload the project details if the project details modal is open
            const projectDetailsModal = document.getElementById('project-details-modal');
            if (projectDetailsModal && projectDetailsModal.classList.contains('active')) {
                await loadProjectDetails(projectId);
            }
            
            // Show success message
            showNotification(taskId ? 'Task updated successfully' : 'Task created successfully', 'success');
        } else {
            throw new Error('Failed to save task');
        }
    } catch (error) {
        console.error('Error saving task:', error);
        showNotification('Failed to save task', 'error');
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = taskId ? 'Update Task' : 'Create Task';
    }
}

// Function to confirm task deletion
function confirmDeleteTask(taskId) {
    // Create confirmation modal if it doesn't exist
    let modal = document.getElementById('confirm-delete-task-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirm-delete-task-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirm Delete</h3>
                    <button type="button" class="close-modal" id="close-confirm-delete-task">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                    <input type="hidden" id="delete-task-id">
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" id="cancel-delete-task">Cancel</button>
                        <button type="button" class="delete-btn" id="confirm-delete-task">Delete Task</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('close-confirm-delete-task').addEventListener('click', closeConfirmDeleteTaskModal);
        document.getElementById('cancel-delete-task').addEventListener('click', closeConfirmDeleteTaskModal);
        document.getElementById('confirm-delete-task').addEventListener('click', handleDeleteTask);
    }
    
    // Set the task ID
    document.getElementById('delete-task-id').value = taskId;
    
    // Show the modal
    modal.classList.add('active');
}

// Function to close the confirm delete task modal
function closeConfirmDeleteTaskModal() {
    const modal = document.getElementById('confirm-delete-task-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Function to handle task deletion
async function handleDeleteTask() {
    const taskId = document.getElementById('delete-task-id').value;
    
    if (!taskId) {
        showNotification('No task selected for deletion', 'error');
        return;
    }
    
    try {
        // Show loading state
        const deleteBtn = document.getElementById('confirm-delete-task');
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        
        // Get the task to get the project ID
        const task = await fetchTaskById(taskId);
        const projectId = task.projectId;
        
        // Delete the task
        const success = await deleteTask(taskId);
        
        if (success) {
            // Close the modal
            closeConfirmDeleteTaskModal();
            
            // Reload the project details if the project details modal is open
            const projectDetailsModal = document.getElementById('project-details-modal');
            if (projectDetailsModal && projectDetailsModal.classList.contains('active')) {
                await loadProjectDetails(projectId);
            }
            
            // Show success message
            showNotification('Task deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task', 'error');
    } finally {
        // Reset button state
        const deleteBtn = document.getElementById('confirm-delete-task');
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = 'Delete Task';
    }
}
