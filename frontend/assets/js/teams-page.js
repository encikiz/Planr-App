// Teams page functionality using database data
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeTeamsPage();
});

// Initialize the teams page
async function initializeTeamsPage() {
    // Show loading overlay
    showLoadingOverlay();

    try {
        // Load current user
        const user = await loadCurrentUser();

        // Store current user in global variable for use in other functions
        window.currentUser = user;

        // Check if we're on the teams page
        const isTeamsPage = document.getElementById('teams-list') !== null;

        if (isTeamsPage) {
            // Load teams list only if we're on the teams page
            await loadTeamsList();
        } else {
            console.log('Not on teams page, skipping loadTeamsList');
        }

        // Set up team buttons event listeners
        setupTeamButtonsEventListeners();

        // Hide loading overlay
        hideLoadingOverlay();

        // Expose loadTeamsList function globally
        window.loadTeamsList = loadTeamsList;

        console.log('Teams page initialized successfully');
    } catch (error) {
        console.error('Error initializing teams page:', error);
        showNotification('Failed to load team data', 'error');
        hideLoadingOverlay();
    }
}

// Function to set up team buttons event listeners
function setupTeamButtonsEventListeners() {
    console.log('Setting up team buttons event listeners');

    // Check if we're on the teams page
    const isTeamsPage = document.querySelector('.new-team-btn') !== null ||
                        document.querySelector('.team-template-btn') !== null;

    if (!isTeamsPage) {
        console.log('Not on teams page, skipping button setup');
        return;
    }

    // New team button functionality
    const newTeamBtn = document.querySelector('.new-team-btn');
    if (newTeamBtn) {
        console.log('Found new team button, adding event listener');
        newTeamBtn.addEventListener('click', function() {
            console.log('New Team button clicked');
            openCreateTeamModal();
        });
    } else {
        console.error('New team button not found');
    }

    // Team template button functionality
    const teamTemplateBtn = document.querySelector('.team-template-btn');
    if (teamTemplateBtn) {
        console.log('Found team template button, adding event listener');
        teamTemplateBtn.addEventListener('click', function() {
            console.log('Use Template button clicked');
            openCreateTeamFromTemplateModal();
        });
    } else {
        console.error('Team template button not found');
    }
}

// Function to show loading overlay
function showLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// Function to hide loading overlay
function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            loadingOverlay.style.opacity = '1';
        }, 300);
    }
}

// Function to load current user
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
            throw new Error('Failed to fetch current user');
        }

        const user = await response.json();

        // Update user profile in header
        updateUserProfile(user);

        return user;
    } catch (error) {
        console.error('Error loading current user:', error);
        return null;
    }
}

// Function to update user profile in header
function updateUserProfile(user) {
    const userProfileElement = document.querySelector('.user-profile');
    if (userProfileElement && user) {
        const nameElement = userProfileElement.querySelector('span');
        const avatarElement = userProfileElement.querySelector('.avatar img');

        if (nameElement) {
            nameElement.textContent = `Welcome, ${user.name}`;
        }

        if (avatarElement) {
            avatarElement.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;
            avatarElement.alt = user.name;
        }
    }
}

// Function to load teams list
async function loadTeamsList() {
    console.log('loadTeamsList function called');
    const teamsList = document.getElementById('teams-list');
    if (!teamsList) {
        console.error('teams-list element not found in the DOM');
        return;
    }
    console.log('teams-list element found, proceeding with loading teams');

    teamsList.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading teams...</div>';

    try {
        // Fetch teams from API
        const teams = await fetchTeams();
        console.log('Teams loaded from API:', teams);

        if (teams.length === 0) {
            teamsList.innerHTML = `
                <div class="empty-section">
                    <i class="fas fa-users"></i>
                    <h4>No Teams Yet</h4>
                    <p>Create your first team to start organizing your projects and members</p>
                    <button type="button" class="create-team-btn" onclick="openCreateTeamModal()">
                        <i class="fas fa-plus"></i> Create Team
                    </button>
                </div>
            `;
            console.log('No teams found, showing empty state');
            return;
        }

        console.log('Found ' + teams.length + ' teams, rendering them');

        // Apply filters and sorting
        const filteredTeams = filterAndSortTeams(teams);

        // Render teams
        renderTeamsList(filteredTeams);
    } catch (error) {
        console.error('Error loading teams:', error);
        teamsList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error Loading Teams</h4>
                <p>There was a problem loading the teams. Please try again later.</p>
            </div>
        `;
    }
}

// Function to filter and sort teams
function filterAndSortTeams(teams) {
    // Get filter values
    const searchTerm = document.getElementById('teams-search')?.value.toLowerCase() || '';
    const projectFilter = document.getElementById('project-filter')?.value || 'all';

    // Filter teams
    let filteredTeams = teams.filter(team => {
        // Search filter
        const matchesSearch =
            team.name.toLowerCase().includes(searchTerm) ||
            (team.description && team.description.toLowerCase().includes(searchTerm)) ||
            (team.department && team.department.toLowerCase().includes(searchTerm));

        // Project filter
        const matchesProject = projectFilter === 'all' ||
            (team.projects && team.projects.some(project =>
                project._id === projectFilter ||
                (typeof project === 'object' && project._id === projectFilter)
            ));

        return matchesSearch && matchesProject;
    });

    // Sort teams by name (default)
    filteredTeams.sort((a, b) => a.name.localeCompare(b.name));

    return filteredTeams;
}

// Function to render teams list
function renderTeamsList(teams) {
    const teamsList = document.getElementById('teams-list');
    if (!teamsList) return;

    teamsList.innerHTML = '';

    teams.forEach((team, index) => {
        // Create team card
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.dataset.id = team._id;

        // Get team leader info
        const teamLeader = team.teamLeader || {};
        const leaderName = teamLeader.name || 'No Leader Assigned';
        const leaderAvatar = teamLeader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderName)}&background=random&color=fff`;

        // Get member count
        const memberCount = team.members ? team.members.length : 0;

        // Get project count
        const projectCount = team.projects ? team.projects.length : 0;

        // Calculate team progress
        let totalProgress = 0;
        if (team.projects && team.projects.length > 0) {
            team.projects.forEach(project => {
                totalProgress += project.progress || 0;
            });
        }
        const avgProgress = projectCount > 0 ? Math.round(totalProgress / projectCount) : 0;

        // Create member avatars HTML
        let memberAvatarsHTML = '';
        if (team.members && team.members.length > 0) {
            // Show up to 5 member avatars
            const displayMembers = team.members.slice(0, 5);
            memberAvatarsHTML = displayMembers.map(member => {
                const memberObj = member.user || member;
                const memberName = memberObj.name || 'Team Member';
                const memberAvatar = memberObj.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=random&color=fff`;
                return `<img src="${memberAvatar}" alt="${memberName}" title="${memberName}">`;
            }).join('');

            // Add more indicator if there are more members
            if (team.members.length > 5) {
                memberAvatarsHTML += `<div class="more-members">+${team.members.length - 5}</div>`;
            }
        }

        // Build team card HTML
        teamCard.innerHTML = `
            <div class="team-card-header">
                <h3>${team.name}</h3>
                ${team.department ? `<span class="team-department">${team.department}</span>` : ''}
            </div>
            <div class="team-card-body">
                <p class="team-description">${team.description || 'No description provided.'}</p>

                <div class="team-members-preview">
                    <div class="member-avatar-stack">
                        ${memberAvatarsHTML}
                    </div>
                    <span class="member-count">${memberCount} member${memberCount !== 1 ? 's' : ''}</span>
                </div>

                <div class="team-stats">
                    <div class="team-stat">
                        <div class="stat-value">${projectCount}</div>
                        <div class="stat-label">Project${projectCount !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="team-stat">
                        <div class="stat-value">${avgProgress}%</div>
                        <div class="stat-label">Progress</div>
                    </div>
                </div>

                <div class="team-progress">
                    <div class="progress-header">
                        <span class="progress-label">Overall Progress</span>
                        <span class="progress-value">${avgProgress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${avgProgress}%"></div>
                    </div>
                </div>

                <div class="team-leader">
                    <h4>Team Leader</h4>
                    <div class="leader-info">
                        <img src="${leaderAvatar}" alt="${leaderName}" class="leader-avatar">
                        <span class="leader-name">${leaderName}</span>
                    </div>
                </div>
            </div>
            <div class="team-card-footer">
                <div class="team-actions">
                    <button type="button" class="team-action-btn view-team-btn" data-team-id="${team._id}" title="View team details">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button type="button" class="team-action-btn edit-team-btn" data-team-id="${team._id}" title="Edit team">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button type="button" class="team-action-btn delete-team-btn" data-team-id="${team._id}" title="Delete team">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            </div>
        `;

        // Add click event to view team details
        const viewTeamBtn = teamCard.querySelector('.view-team-btn');
        if (viewTeamBtn) {
            viewTeamBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                viewTeamDetails(team._id);
            });
        }

        // Add click event to edit team
        const editTeamBtn = teamCard.querySelector('.edit-team-btn');
        if (editTeamBtn) {
            editTeamBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Edit team button clicked for team:', team._id);
                openEditTeamModal(team._id);
            });
        }

        // Add click event to delete team
        const deleteTeamBtn = teamCard.querySelector('.delete-team-btn');
        if (deleteTeamBtn) {
            deleteTeamBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Delete team button clicked for team:', team._id);
                openDeleteTeamConfirmation(team._id, team.name);
            });
        }

        // Add click event to the entire card
        teamCard.addEventListener('click', () => {
            console.log('Team card clicked for team:', team._id);
            viewTeamDetails(team._id);
        });

        // Add a staggered entrance animation
        teamCard.style.opacity = '0';
        teamCard.style.transform = 'translateY(10px)';

        teamsList.appendChild(teamCard);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            teamCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            teamCard.style.opacity = '1';
            teamCard.style.transform = 'translateY(0)';
        }, 30 + (index * 30));
    });
}

// Function to view team details
function viewTeamDetails(teamId) {
    console.log('Viewing team details for team ID:', teamId);

    // Highlight the selected team card
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.id === teamId) {
            card.classList.add('selected');
        }
    });

    // Fetch team details
    fetchTeamById(teamId).then(team => {
        if (!team) {
            showNotification('Failed to load team details', 'error');
            return;
        }

        console.log('Team details loaded successfully:', team.name);

        // Create modal HTML
        const modalHTML = createTeamDetailsModalHTML(team);

        // Create and show the modal
        const modal = document.createElement('div');
        modal.className = 'modal team-details-modal';
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
        setupTeamDetailsModalEventListeners(modal, backdrop, team);
    });
}

// Function to create team details modal HTML
function createTeamDetailsModalHTML(team) {
    // Get team leader info
    const teamLeader = team.teamLeader || {};
    const leaderName = teamLeader.name || 'No Leader Assigned';
    const leaderAvatar = teamLeader.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderName)}&background=random&color=fff`;

    // Get member count
    const memberCount = team.members ? team.members.length : 0;

    // Get project count
    const projectCount = team.projects ? team.projects.length : 0;

    // Calculate team progress
    let totalProgress = 0;
    if (team.projects && team.projects.length > 0) {
        team.projects.forEach(project => {
            totalProgress += project.progress || 0;
        });
    }
    const avgProgress = projectCount > 0 ? Math.round(totalProgress / projectCount) : 0;

    // Create members HTML
    let membersHTML = '';
    if (team.members && team.members.length > 0) {
        membersHTML = team.members.map(member => {
            const memberObj = member.user || member;
            const memberName = memberObj.name || 'Team Member';
            const memberRole = member.role || memberObj.role || 'Team Member';
            const memberAvatar = memberObj.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=random&color=fff`;
            const isLeader = team.teamLeader && team.teamLeader._id === memberObj._id;

            return `
                <div class="team-member-item ${isLeader ? 'leader' : ''}">
                    <div class="team-member-avatar">
                        <img src="${memberAvatar}" alt="${memberName}">
                    </div>
                    <div class="team-member-info">
                        <h4 class="team-member-name">${memberName}</h4>
                        <p class="team-member-role">${memberRole}</p>
                    </div>
                    <div class="team-member-actions">
                        <a href="team-members.html?id=${memberObj._id}" class="team-member-action" title="View Member">
                            <i class="fas fa-eye"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        membersHTML = `
            <div class="empty-section">
                <i class="fas fa-users"></i>
                <h4>No Team Members</h4>
                <p>This team doesn't have any members yet.</p>
            </div>
        `;
    }

    // Create projects HTML
    let projectsHTML = '';
    if (team.projects && team.projects.length > 0) {
        projectsHTML = team.projects.map(project => {
            const projectName = project.name || 'Unnamed Project';
            const projectProgress = project.progress || 0;
            const projectStatus = project.status || 'not-started';

            // Format dates
            const startDate = project.startDate ? new Date(project.startDate) : new Date();
            const endDate = project.endDate ? new Date(project.endDate) : new Date();
            const startDateFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endDateFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return `
                <div class="team-project-item">
                    <div class="team-project-header">
                        <h4 class="team-project-name">${projectName}</h4>
                        <span class="team-project-status ${projectStatus}">${formatStatus(projectStatus)}</span>
                    </div>
                    <div class="team-project-progress">
                        <div class="progress-header">
                            <span class="progress-label">Progress</span>
                            <span class="progress-value">${projectProgress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${projectProgress}%"></div>
                        </div>
                    </div>
                    <div class="team-project-dates">
                        <span>${startDateFormatted}</span>
                        <span>${endDateFormatted}</span>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        projectsHTML = `
            <div class="empty-section">
                <i class="fas fa-project-diagram"></i>
                <h4>No Projects</h4>
                <p>This team doesn't have any projects assigned yet.</p>
            </div>
        `;
    }

    // Create team hierarchy HTML
    let hierarchyHTML = '';
    if (team.teamLeader) {
        hierarchyHTML = `
            <div class="hierarchy-container">
                <div class="hierarchy-level">
                    <div class="hierarchy-node leader">
                        <img src="${leaderAvatar}" alt="${leaderName}">
                        <div class="hierarchy-node-info">
                            <span class="hierarchy-node-name">${leaderName}</span>
                            <span class="hierarchy-node-role">Team Leader</span>
                        </div>
                    </div>
                </div>
                ${team.members && team.members.length > 1 ? `
                <div class="hierarchy-connector"></div>
                <div class="hierarchy-level">
                    ${team.members.filter(member => {
                        const memberObj = member.user || member;
                        return !team.teamLeader || team.teamLeader._id !== memberObj._id;
                    }).map(member => {
                        const memberObj = member.user || member;
                        const memberName = memberObj.name || 'Team Member';
                        const memberRole = member.role || memberObj.role || 'Team Member';
                        const memberAvatar = memberObj.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=random&color=fff`;

                        return `
                            <div class="hierarchy-node">
                                <img src="${memberAvatar}" alt="${memberName}">
                                <div class="hierarchy-node-info">
                                    <span class="hierarchy-node-name">${memberName}</span>
                                    <span class="hierarchy-node-role">${memberRole}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ` : ''}
            </div>
        `;
    } else {
        hierarchyHTML = `
            <div class="empty-section">
                <i class="fas fa-sitemap"></i>
                <h4>No Team Hierarchy</h4>
                <p>This team doesn't have a leader assigned yet.</p>
            </div>
        `;
    }

    // Create performance metrics HTML
    const performanceHTML = `
        <div class="performance-chart-container">
            <canvas id="team-performance-chart"></canvas>
        </div>
        <div class="performance-metrics">
            <div class="performance-metric">
                <span class="metric-label">Team Size</span>
                <span class="metric-value">${memberCount} member${memberCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="performance-metric">
                <span class="metric-label">Projects</span>
                <span class="metric-value">${projectCount}</span>
            </div>
            <div class="performance-metric">
                <span class="metric-label">Average Progress</span>
                <span class="metric-value">${avgProgress}%</span>
            </div>
            <div class="performance-metric">
                <span class="metric-label">Tasks Completed</span>
                <span class="metric-value">${Math.floor(Math.random() * 20)}</span>
            </div>
            <div class="performance-metric">
                <span class="metric-label">Tasks In Progress</span>
                <span class="metric-value">${Math.floor(Math.random() * 15)}</span>
            </div>
        </div>
    `;

    return `
        <div class="modal-header">
            <h3><i class="fas fa-users"></i> ${team.name}</h3>
            <button type="button" class="close-modal-btn" aria-label="Close modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="team-detail-header">
                <div class="team-detail-info">
                    <h2>${team.name}</h2>
                    ${team.department ? `<span class="team-department">${team.department}</span>` : ''}
                    <p class="team-description">${team.description || 'No description provided.'}</p>
                </div>
                <div class="team-detail-actions">
                    <button type="button" class="edit-team-btn" data-team-id="${team._id}" title="Edit team details">
                        <i class="fas fa-edit"></i> Edit Team
                    </button>
                    <button type="button" class="delete-team-btn" data-team-id="${team._id}" title="Delete this team">
                        <i class="fas fa-trash-alt"></i> Delete Team
                    </button>
                </div>
            </div>

            <div class="team-detail-body">
                <div class="team-detail-section">
                    <h3><i class="fas fa-sitemap"></i> Team Hierarchy</h3>
                    <div class="team-hierarchy">
                        ${hierarchyHTML}
                    </div>
                </div>

                <div class="team-detail-section">
                    <h3><i class="fas fa-users"></i> Team Members</h3>
                    <div class="team-members">
                        ${membersHTML}
                    </div>
                </div>

                <div class="team-detail-section">
                    <h3><i class="fas fa-project-diagram"></i> Projects</h3>
                    <div class="team-projects">
                        ${projectsHTML}
                    </div>
                </div>

                <div class="team-detail-section">
                    <h3><i class="fas fa-chart-line"></i> Performance</h3>
                    <div class="team-performance">
                        ${performanceHTML}
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="cancel-btn">Close</button>
        </div>
    `;
}

// Function to set up event listeners for the team details modal
function setupTeamDetailsModalEventListeners(modal, backdrop, team) {
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

    // Edit team button
    const editTeamBtn = modal.querySelector('.edit-team-btn');
    if (editTeamBtn) {
        editTeamBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
            openEditTeamModal(team._id);
        });
    }

    // Delete team button
    const deleteTeamBtn = modal.querySelector('.delete-team-btn');
    if (deleteTeamBtn) {
        deleteTeamBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
            openDeleteTeamConfirmation(team._id, team.name);
        });
    }

    // Initialize performance chart
    initializeTeamPerformanceChart(team);
}

// Function to initialize team performance chart
function initializeTeamPerformanceChart(team) {
    const chartCanvas = document.getElementById('team-performance-chart');
    if (!chartCanvas) return;

    // Generate some sample data for the chart
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const taskCompletionData = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
    ];
    const progressData = [
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100)
    ];

    // Create the chart
    new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tasks Completed',
                    data: taskCompletionData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Progress (%)',
                    data: progressData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 6
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Function to close modal
function closeModal(modal, backdrop) {
    // Hide modal with animation
    modal.classList.remove('show');
    backdrop.classList.remove('show');

    // Remove modal after animation
    setTimeout(() => {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
    }, 300);
}

// Function to open delete team confirmation modal
function openDeleteTeamConfirmation(teamId, teamName) {
    console.log('Opening delete team confirmation for team:', teamId, teamName);

    // Create modal HTML
    const modalHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-exclamation-triangle"></i> Delete Team</h3>
            <button type="button" class="close-modal-btn" aria-label="Close modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="confirmation-message">
                <p>Are you sure you want to delete the team <strong>${teamName}</strong>?</p>
                <p class="warning-text"><i class="fas fa-exclamation-circle"></i> This action cannot be undone.</p>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="cancel-btn">Cancel</button>
            <button type="button" class="delete-btn" id="confirm-delete-btn" data-team-id="${teamId}">Delete Team</button>
        </div>
    `;

    // Create and show the modal
    const modal = document.createElement('div');
    modal.className = 'modal confirmation-modal';
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
    setupDeleteConfirmationModalEventListeners(modal, backdrop, teamId, teamName);
}

// Function to set up event listeners for the delete confirmation modal
function setupDeleteConfirmationModalEventListeners(modal, backdrop, teamId, teamName) {
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

    // Delete team on confirm button click
    const confirmDeleteBtn = modal.querySelector('#confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            // Show loading state
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

            // Delete the team
            try {
                const success = await deleteTeam(teamId);
                if (success) {
                    showNotification(`Team "${teamName}" deleted successfully`, 'success');
                    closeModal(modal, backdrop);

                    // Reload teams list
                    console.log('Reloading teams list after team deletion');
                    setTimeout(() => {
                        if (typeof loadTeamsList === 'function') {
                            loadTeamsList();
                        } else {
                            console.error('loadTeamsList function not found');
                            // Try to reload the page as a fallback
                            window.location.reload();
                        }
                    }, 300);
                } else {
                    confirmDeleteBtn.disabled = false;
                    confirmDeleteBtn.innerHTML = 'Delete Team';
                }
            } catch (error) {
                console.error('Error deleting team:', error);
                showNotification('Failed to delete team', 'error');
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.innerHTML = 'Delete Team';
            }
        });
    }
}

// Function to format status text
function formatStatus(status) {
    switch (status) {
        case 'completed':
            return 'Completed';
        case 'in-progress':
            return 'In Progress';
        case 'planning':
            return 'Planning';
        case 'not-started':
            return 'Not Started';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
    }
}
