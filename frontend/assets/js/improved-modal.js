// Improved Modal Implementation for Projects

// Function to open the improved new project modal
function openImprovedNewProjectModal() {
    // Create modal if it doesn't exist
    let modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'improved-project-modal-overlay';

    // Get current user information
    let userName = "User";
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Failed to fetch user data');
        })
        .then(userData => {
            userName = userData.name || "User";
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        })
        .finally(() => {
            // Create the modal content
            const today = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1); // Default end date is 1 month from now

            modalOverlay.innerHTML = `
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Create New Project</h3>
                        <button type="button" class="close-modal" id="close-improved-project-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="improved-project-form">
                            <div class="form-group">
                                <label for="project-name">Project Name <span class="required">*</span></label>
                                <input type="text" id="project-name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="project-description">Description</label>
                                <textarea id="project-description" name="description" rows="3" placeholder="Enter project description or leave empty for default..."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="project-start-date">Start Date <span class="required">*</span></label>
                                    <input type="date" id="project-start-date" name="startDate" required value="${formatDateForInput(today)}">
                                </div>
                                <div class="form-group">
                                    <label for="project-end-date">End Date <span class="required">*</span></label>
                                    <input type="date" id="project-end-date" name="endDate" required value="${formatDateForInput(endDate)}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="project-status">Status <span class="required">*</span></label>
                                    <select id="project-status" name="status" required>
                                        <option value="not-started">Not Started</option>
                                        <option value="planning">Planning</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="project-priority">Priority <span class="required">*</span></label>
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
                                <button type="button" class="cancel-btn" id="cancel-improved-project">Cancel</button>
                                <button type="submit" class="submit-btn">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            // Add to DOM
            document.body.appendChild(modalOverlay);

            // Load team members for selection
            loadTeamMembersForProjectModal();

            // Add event listeners
            document.getElementById('close-improved-project-modal').addEventListener('click', closeImprovedProjectModal);
            document.getElementById('cancel-improved-project').addEventListener('click', closeImprovedProjectModal);
            document.getElementById('improved-project-form').addEventListener('submit', handleImprovedProjectSubmit);

            // Show the modal with animation
            setTimeout(() => {
                modalOverlay.classList.add('active');
            }, 10);
        });
}

// Function to close the improved project modal
function closeImprovedProjectModal() {
    const modalOverlay = document.getElementById('improved-project-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        modalOverlay.classList.add('fade-out');
        setTimeout(() => {
            modalOverlay.remove();
        }, 300);
    }
}

// Function to handle improved project form submission
async function handleImprovedProjectSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Get selected team members
    const teamMembers = getSelectedTeamMembers();

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
            closeImprovedProjectModal();

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

// Function to load team members for project modal
async function loadTeamMembersForProjectModal() {
    const teamSelectionContainer = document.getElementById('team-selection');
    if (!teamSelectionContainer) return;

    teamSelectionContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading team members...</div>';

    try {
        // Fetch team members from API
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Failed to fetch team members');
        }

        const teamMembers = await response.json();

        // Clear loading indicator
        teamSelectionContainer.innerHTML = '';

        if (teamMembers.length === 0) {
            teamSelectionContainer.innerHTML = '<p>No team members available</p>';
            return;
        }

        // Create checkboxes for each team member
        teamMembers.forEach(member => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'team-member-checkbox';

            // Get member avatar or generate one
            const avatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`;

            memberDiv.innerHTML = `
                <label for="member-${member._id}">
                    <input type="checkbox" id="member-${member._id}" name="teamMembers" value="${member._id}">
                    <img src="${avatar}" alt="${member.name}" class="member-avatar">
                    <span>${member.name}</span>
                </label>
            `;

            teamSelectionContainer.appendChild(memberDiv);
        });
    } catch (error) {
        console.error('Error loading team members:', error);
        teamSelectionContainer.innerHTML = '<p class="error">Failed to load team members</p>';
    }
}

// Function to get selected team members
function getSelectedTeamMembers() {
    const selectedMembers = [];
    const checkboxes = document.querySelectorAll('input[name="teamMembers"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedMembers.push(checkbox.value);
    });
    
    return selectedMembers;
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
