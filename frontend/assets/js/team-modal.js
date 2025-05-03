// Team Modal Functionality

// Function to fetch team templates from the API
async function fetchTeamTemplates() {
    try {
        console.log('Fetching team templates from API...');
        const response = await fetch('/api/templates/teams');
        if (!response.ok) {
            throw new Error('Failed to fetch team templates');
        }
        const templates = await response.json();
        console.log('Team templates fetched successfully:', templates);
        return templates;
    } catch (error) {
        console.error('Error fetching team templates:', error);
        showNotification('Failed to load team templates', 'error');

        // Fallback to default templates if API fails
        return [
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
                name: "Project Management Team",
                description: "Team overseeing project planning and execution",
                roles: ["Project Manager", "Product Owner", "Scrum Master", "Business Analyst"]
            }
        ];
    }
}

// Function to open the create team modal
window.openCreateTeamModal = function() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-users"></i> Create New Team</h3>
            <button type="button" class="close-modal-btn" aria-label="Close modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <form id="create-team-form" class="team-creation-form">
                <div class="form-group">
                    <label for="team-name">Team Name <span class="required">*</span></label>
                    <input type="text" id="team-name" name="name" required placeholder="Enter team name">
                </div>

                <div class="form-group">
                    <label for="team-description">Description</label>
                    <textarea id="team-description" name="description" placeholder="Enter team description">Team created by ${window.currentUser ? window.currentUser.name : 'user'}</textarea>
                </div>

                <div class="form-group">
                    <label for="team-department">Department</label>
                    <select id="team-department" name="department">
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Product">Product</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="team-leader">Team Leader</label>
                    <select id="team-leader" name="teamLeader">
                        <option value="">Select Team Leader</option>
                        <!-- Team members will be loaded here dynamically -->
                    </select>
                </div>

                <div class="form-group team-members-selection">
                    <label>Team Members</label>
                    <div id="team-members-container">
                        <!-- Team members will be loaded here dynamically -->
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading team members...
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="cancel-btn">Cancel</button>
            <button type="button" class="save-btn" id="create-team-btn">Create Team</button>
        </div>
    `;

    // Create and show the modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
        backdrop.classList.add('show');
    }, 10);

    // Load team members for selection
    loadTeamMembersForSelection();

    // Set up event listeners
    setupModalEventListeners(modal, backdrop);
}

// Function to open the create team from template modal
window.openCreateTeamFromTemplateModal = async function() {
    // Show loading indicator
    const loadingModal = document.createElement('div');
    loadingModal.className = 'modal loading-modal show';
    loadingModal.innerHTML = `
        <div class="modal-content">
            <div class="loading-spinner"></div>
            <p>Loading templates...</p>
        </div>
    `;
    document.body.appendChild(loadingModal);

    // Fetch templates from API
    const templates = await fetchTeamTemplates();

    // Remove loading indicator
    document.body.removeChild(loadingModal);

    // Create modal HTML
    let templatesHTML = '';
    templates.forEach(template => {
        templatesHTML += `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <h4>${template.name}</h4>
                </div>
                <div class="template-body">
                    <p>${template.description}</p>
                    <div class="template-roles">
                        <h5>Suggested Roles:</h5>
                        <ul>
                            ${template.roles.map(role => `<li>${role}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="template-footer">
                    <button type="button" class="use-template-btn" data-template-id="${template.id}">
                        Use Template
                    </button>
                </div>
            </div>
        `;
    });

    const modalHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-clipboard-list"></i> Create Team from Template</h3>
            <button type="button" class="close-modal-btn" aria-label="Close modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <p class="modal-description">Select a template to quickly create a team with predefined roles and structure.</p>
            <div class="templates-grid">
                ${templatesHTML}
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="cancel-btn">Cancel</button>
        </div>
    `;

    // Create and show the modal
    const modal = document.createElement('div');
    modal.className = 'modal template-modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
        backdrop.classList.add('show');
    }, 10);

    // Set up event listeners
    setupTemplateModalEventListeners(modal, backdrop);
}

// Function to open the edit team modal
window.openEditTeamModal = function(teamId) {
    // Fetch team data
    fetchTeamById(teamId).then(team => {
        if (!team) {
            showNotification('Failed to load team details', 'error');
            return;
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-users"></i> Edit Team</h3>
                <button type="button" class="close-modal-btn" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="edit-team-form" class="team-creation-form" data-team-id="${team._id}">
                    <div class="form-group">
                        <label for="team-name">Team Name <span class="required">*</span></label>
                        <input type="text" id="team-name" name="name" required placeholder="Enter team name" value="${team.name}">
                    </div>

                    <div class="form-group">
                        <label for="team-description">Description</label>
                        <textarea id="team-description" name="description" placeholder="Enter team description">${team.description || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="team-department">Department</label>
                        <select id="team-department" name="department">
                            <option value="">Select Department</option>
                            <option value="Engineering" ${team.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                            <option value="Design" ${team.department === 'Design' ? 'selected' : ''}>Design</option>
                            <option value="Marketing" ${team.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                            <option value="Product" ${team.department === 'Product' ? 'selected' : ''}>Product</option>
                            <option value="Sales" ${team.department === 'Sales' ? 'selected' : ''}>Sales</option>
                            <option value="HR" ${team.department === 'HR' ? 'selected' : ''}>HR</option>
                            <option value="Finance" ${team.department === 'Finance' ? 'selected' : ''}>Finance</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="team-leader">Team Leader</label>
                        <select id="team-leader" name="teamLeader">
                            <option value="">Select Team Leader</option>
                            <!-- Team members will be loaded here dynamically -->
                        </select>
                    </div>

                    <div class="form-group team-members-selection">
                        <label>Team Members</label>
                        <div id="team-members-container">
                            <!-- Team members will be loaded here dynamically -->
                            <div class="loading-spinner">
                                <i class="fas fa-spinner fa-spin"></i> Loading team members...
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="button" class="save-btn" id="update-team-btn">Update Team</button>
            </div>
        `;

        // Create and show the modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);

        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
            backdrop.classList.add('show');
        }, 10);

        // Load team members for selection
        loadTeamMembersForSelection(team);

        // Set up event listeners
        setupEditModalEventListeners(modal, backdrop, team);
    });
}

// Function to load team members for selection in modals
async function loadTeamMembersForSelection(team = null) {
    try {
        // Fetch team members
        const teamMembers = await fetchTeamMembers();

        if (!teamMembers || teamMembers.length === 0) {
            document.getElementById('team-members-container').innerHTML = '<p>No team members available</p>';
            return;
        }

        // Populate team leader dropdown
        const teamLeaderSelect = document.getElementById('team-leader');
        if (teamLeaderSelect) {
            teamLeaderSelect.innerHTML = '<option value="">Select Team Leader</option>';

            teamMembers.forEach(member => {
                const isSelected = team && team.teamLeader && team.teamLeader._id === member._id;
                teamLeaderSelect.innerHTML += `
                    <option value="${member._id}" ${isSelected ? 'selected' : ''}>
                        ${member.name} (${member.role || 'Team Member'})
                    </option>
                `;
            });
        }

        // Render team members selection
        const selectedMembers = team ? team.members || [] : [];
        await renderTeamMemberSelection('team-members-container', selectedMembers);
    } catch (error) {
        console.error('Error loading team members for selection:', error);
        document.getElementById('team-members-container').innerHTML = '<p class="error">Failed to load team members</p>';
    }
}

// Function to set up event listeners for the create team modal
function setupModalEventListeners(modal, backdrop) {
    // Close modal on close button click
    const closeBtn = modal.querySelector('.close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on cancel button click
    const cancelBtn = modal.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on backdrop click
    backdrop.addEventListener('click', () => {
        closeModal(modal, backdrop);
    });

    // Create team on button click
    const createTeamBtn = modal.querySelector('#create-team-btn');
    if (createTeamBtn) {
        createTeamBtn.addEventListener('click', async () => {
            // Get form data
            const form = modal.querySelector('#create-team-form');
            const name = form.querySelector('#team-name').value.trim();
            const description = form.querySelector('#team-description').value.trim();
            const department = form.querySelector('#team-department').value;
            const teamLeader = form.querySelector('#team-leader').value;
            const members = getSelectedTeamMembers('team-members-container');

            // Validate form
            if (!name) {
                showNotification('Team name is required', 'error');
                return;
            }

            // Create team data object
            const teamData = {
                name,
                description: description || `Team created by ${window.currentUser ? window.currentUser.name : 'user'}`,
                department: department || undefined,
                teamLeader: teamLeader || undefined,
                members: members.map(memberId => ({
                    user: memberId,
                    role: 'Team Member'
                }))
            };

            // Create team
            const newTeam = await createTeam(teamData);

            if (newTeam) {
                showNotification(`Team "${name}" created successfully`, 'success');
                closeModal(modal, backdrop);

                // Reload teams list
                console.log('Reloading teams list after team creation');
                setTimeout(() => {
                    // Force reload the teams list
                    console.log('Reloading teams list');
                    if (typeof loadTeamsList === 'function') {
                        loadTeamsList();
                    } else {
                        console.error('loadTeamsList function not found');
                        // Try to reload the page as a fallback
                        window.location.reload();
                    }
                }, 300);
            }
        });
    }
}

// Function to fetch a specific team template from the API
async function fetchTeamTemplate(templateId) {
    try {
        console.log(`Fetching team template ${templateId} from API...`);
        const response = await fetch(`/api/templates/teams/${templateId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch team template');
        }
        const template = await response.json();
        console.log('Team template fetched successfully:', template);
        return template;
    } catch (error) {
        console.error('Error fetching team template:', error);
        showNotification('Failed to load team template', 'error');
        return null;
    }
}

// Function to set up event listeners for the template modal
function setupTemplateModalEventListeners(modal, backdrop) {
    // Close modal on close button click
    const closeBtn = modal.querySelector('.close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on cancel button click
    const cancelBtn = modal.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on backdrop click
    backdrop.addEventListener('click', () => {
        closeModal(modal, backdrop);
    });

    // Use template buttons
    const useTemplateBtns = modal.querySelectorAll('.use-template-btn');
    useTemplateBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const templateId = parseInt(btn.getAttribute('data-template-id'));

            // Show loading indicator
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;

            // Fetch template from API
            const template = await fetchTeamTemplate(templateId);

            if (template) {
                // Close template modal
                closeModal(modal, backdrop);

                // Wait for the modal to fully close before opening the new one
                setTimeout(() => {
                    // Open create team modal with template data
                    openCreateTeamModalWithTemplate(template);
                }, 350); // Wait a bit longer than the close animation (300ms)
            } else {
                // Reset button if template fetch failed
                btn.innerHTML = 'Use Template';
                btn.disabled = false;
            }
        });
    });
}

// Function to set up event listeners for the edit team modal
function setupEditModalEventListeners(modal, backdrop, team) {
    // Close modal on close button click
    const closeBtn = modal.querySelector('.close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on cancel button click
    const cancelBtn = modal.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on backdrop click
    backdrop.addEventListener('click', () => {
        closeModal(modal, backdrop);
    });

    // Update team on button click
    const updateTeamBtn = modal.querySelector('#update-team-btn');
    if (updateTeamBtn) {
        updateTeamBtn.addEventListener('click', async () => {
            // Get form data
            const form = modal.querySelector('#edit-team-form');
            const teamId = form.getAttribute('data-team-id');
            const name = form.querySelector('#team-name').value.trim();
            const description = form.querySelector('#team-description').value.trim();
            const department = form.querySelector('#team-department').value;
            const teamLeader = form.querySelector('#team-leader').value;
            const members = getSelectedTeamMembers('team-members-container');

            // Validate form
            if (!name) {
                showNotification('Team name is required', 'error');
                return;
            }

            // Create team data object
            const teamData = {
                name,
                description: description || `Team created by ${window.currentUser ? window.currentUser.name : 'user'}`,
                department: department || undefined,
                teamLeader: teamLeader || undefined,
                members: members.map(memberId => ({
                    user: memberId,
                    role: 'Team Member'
                }))
            };

            // Update team
            const updatedTeam = await updateTeam(teamId, teamData);

            if (updatedTeam) {
                showNotification(`Team "${name}" updated successfully`, 'success');
                closeModal(modal, backdrop);

                // Reload teams list
                console.log('Reloading teams list after team update');
                setTimeout(() => {
                    // Force reload the teams list
                    console.log('Reloading teams list');
                    if (typeof loadTeamsList === 'function') {
                        loadTeamsList();
                    } else {
                        console.error('loadTeamsList function not found');
                        // Try to reload the page as a fallback
                        window.location.reload();
                    }
                }, 300);
            }
        });
    }
}

// Function to open create team modal with template data
function openCreateTeamModalWithTemplate(template) {
    // Create modal HTML
    const modalHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-users"></i> Create Team from Template</h3>
            <button type="button" class="close-modal-btn" aria-label="Close modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <form id="create-team-form" class="team-creation-form">
                <div class="form-group">
                    <label for="team-name">Team Name <span class="required">*</span></label>
                    <input type="text" id="team-name" name="name" required placeholder="Enter team name" value="${template.name}">
                </div>

                <div class="form-group">
                    <label for="team-description">Description</label>
                    <textarea id="team-description" name="description" placeholder="Enter team description">${template.description || `Team created by ${window.currentUser ? window.currentUser.name : 'user'}`}</textarea>
                </div>

                <div class="form-group">
                    <label for="team-department">Department</label>
                    <select id="team-department" name="department">
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design" ${template.name.includes('Design') ? 'selected' : ''}>Design</option>
                        <option value="Marketing" ${template.name.includes('Marketing') ? 'selected' : ''}>Marketing</option>
                        <option value="Product" ${template.name.includes('Project') ? 'selected' : ''}>Product</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="team-leader">Team Leader</label>
                    <select id="team-leader" name="teamLeader">
                        <option value="">Select Team Leader</option>
                        <!-- Team members will be loaded here dynamically -->
                    </select>
                </div>

                <div class="form-group team-members-selection">
                    <label>Team Members</label>
                    <div id="team-members-container">
                        <!-- Team members will be loaded here dynamically -->
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i> Loading team members...
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="cancel-btn">Cancel</button>
            <button type="button" class="save-btn" id="create-team-btn">Create Team</button>
        </div>
    `;

    // Create and show the modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
        backdrop.classList.add('show');
    }, 10);

    // Load team members for selection
    loadTeamMembersForSelection();

    // Set up event listeners
    setupModalEventListeners(modal, backdrop);
}

// Function to close modal
function closeModal(modal, backdrop) {
    // Hide modal with animation
    modal.classList.remove('show');
    backdrop.classList.remove('show');

    // Remove modal after animation
    setTimeout(() => {
        // Check if elements still exist in the DOM before removing
        if (modal && modal.parentNode) {
            document.body.removeChild(modal);
        }
        if (backdrop && backdrop.parentNode) {
            document.body.removeChild(backdrop);
        }
    }, 300);
}

// Add CSS for template modal
const templateModalCSS = `
    .templates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .template-card {
        background-color: var(--background-card);
        border-radius: var(--border-radius-md);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .template-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    }

    .template-header {
        padding: 15px;
        border-bottom: 1px solid var(--border-light);
        background-color: var(--background-hover);
    }

    .template-header h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .template-body {
        padding: 15px;
    }

    .template-body p {
        margin: 0 0 15px 0;
        font-size: 14px;
        color: var(--text-secondary);
    }

    .template-roles h5 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .template-roles ul {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: var(--text-secondary);
    }

    .template-footer {
        padding: 10px 15px;
        border-top: 1px solid var(--border-light);
        text-align: right;
    }

    .use-template-btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: var(--border-radius-sm);
        padding: 6px 12px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .use-template-btn:hover {
        background-color: var(--primary-color-dark);
    }

    [data-theme="dark"] .template-card {
        background-color: var(--background-card-dark);
    }

    [data-theme="dark"] .template-header {
        background-color: var(--background-hover-dark);
        border-bottom-color: var(--border-dark);
    }

    [data-theme="dark"] .template-footer {
        border-top-color: var(--border-dark);
    }
`;

// Add the CSS to the page
function addTemplateModalStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = templateModalCSS;
    document.head.appendChild(styleElement);
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    addTemplateModalStyles();
});
