// Team Members page functionality using database data
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeTeamMembersPage();
});

// Using the global showNotification function from notification.js

// Initialize the team members page
async function initializeTeamMembersPage() {
    // Show loading overlay
    showLoadingOverlay();

    try {
        // Load current user
        const user = await loadCurrentUser();

        // Store current user in global variable for use in other functions
        window.currentUser = user;

        // Load team members
        await loadTeamMembers();

        // Set up event listeners
        setupEventListeners();

        // Hide loading overlay
        hideLoadingOverlay();

        // Expose loadTeamMembers function globally
        window.loadTeamMembers = loadTeamMembers;

        console.log('Team Members page initialized successfully');
    } catch (error) {
        console.error('Error initializing team members page:', error);
        showNotification('Failed to load team members data', 'error');
        hideLoadingOverlay();
    }
}

// Function to set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');

    // New member button functionality
    const newMemberBtn = document.querySelector('.new-member-btn');
    if (newMemberBtn) {
        console.log('Found new member button, adding event listener');
        newMemberBtn.addEventListener('click', function() {
            console.log('New Member button clicked');
            openCreateMemberModal();
        });
    } else {
        console.error('New member button not found');
    }

    // Department filter functionality
    const departmentFilter = document.getElementById('department-filter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', function() {
            console.log('Department filter changed to:', this.value);
            filterAndSortTeamMembers();
        });
    }

    // Sort by functionality
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            console.log('Sort by changed to:', this.value);
            filterAndSortTeamMembers();
        });
    }

    // Search functionality
    const searchInput = document.getElementById('team-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            console.log('Search input changed to:', this.value);
            filterAndSortTeamMembers();
        });
    }

    // Tab switching functionality
    setupTabSwitching();
}

// Function to set up tab switching
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    console.log('Setting up tab switching with', tabButtons.length, 'buttons');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log('Tab button clicked:', tabName);

            // Remove active class from all buttons and tab panes
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
                // Force hide all panes
                pane.style.display = 'none';
                pane.style.opacity = '0';
            });

            // Add active class to clicked button and corresponding tab pane
            this.classList.add('active');

            const targetPane = document.getElementById(`${tabName}-tab`);
            if (targetPane) {
                targetPane.classList.add('active');
                // Force show the active pane
                targetPane.style.display = 'block';
                targetPane.style.opacity = '1';
                console.log('Activated tab pane:', tabName, targetPane);
            } else {
                console.error('Could not find tab pane with id:', `${tabName}-tab`);
            }
        });
    });

    // Make sure the Performance tab is active by default
    const performanceTab = document.querySelector('.tab-btn[data-tab="performance"]');
    if (performanceTab) {
        performanceTab.click();
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

// Function to load team members
async function loadTeamMembers() {
    console.log('Loading team members');
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) {
        console.error('team-grid element not found in the DOM');
        return;
    }

    teamGrid.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading team members...</div>';

    try {
        // Use our loadTeamMembersList function to load team members
        await loadTeamMembersList();
    } catch (error) {
        console.error('Error loading team members:', error);
        teamGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error Loading Team Members</h4>
                <p>There was a problem loading the team members. Please try again later.</p>
            </div>
        `;
    }
}

// Function to filter and sort team members
function filterAndSortTeamMembers() {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) {
        console.error('team-grid element not found in the DOM');
        return;
    }

    if (!window.teamMembers) {
        console.error('No team members data available');
        return;
    }

    // Check if team members array is empty
    if (window.teamMembers.length === 0) {
        teamGrid.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-user-friends"></i>
                <h4>No Team Members Yet</h4>
                <p>Add your first team member to start collaborating</p>
                <button type="button" class="create-member-btn">
                    <i class="fas fa-plus"></i> Add Member
                </button>
            </div>
        `;

        // Add event listener to the create member button
        const createMemberBtn = teamGrid.querySelector('.create-member-btn');
        if (createMemberBtn) {
            createMemberBtn.addEventListener('click', function() {
                console.log('Create member button clicked from empty state');
                openCreateMemberModal();
            });
        }
        return;
    }

    // Get filter values
    const searchTerm = document.getElementById('team-search')?.value.toLowerCase() || '';
    const departmentFilter = document.getElementById('department-filter')?.value || 'all';
    const sortBy = document.getElementById('sort-by')?.value || 'name-asc';

    // Filter members
    let filteredMembers = window.teamMembers.filter(member => {
        // Search filter
        const matchesSearch =
            member.name.toLowerCase().includes(searchTerm) ||
            (member.role && member.role.toLowerCase().includes(searchTerm)) ||
            (member.department && member.department.toLowerCase().includes(searchTerm)) ||
            (member.email && member.email.toLowerCase().includes(searchTerm));

        // Department filter
        const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;

        return matchesSearch && matchesDepartment;
    });

    // Sort members
    switch (sortBy) {
        case 'name-asc':
            filteredMembers.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredMembers.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'role':
            filteredMembers.sort((a, b) => {
                const roleA = a.role || '';
                const roleB = b.role || '';
                return roleA.localeCompare(roleB);
            });
            break;
        case 'department':
            filteredMembers.sort((a, b) => {
                const deptA = a.department || '';
                const deptB = b.department || '';
                return deptA.localeCompare(deptB);
            });
            break;
    }

    // Render filtered and sorted members
    renderTeamMembers(filteredMembers);
}

// Function to render team members
function renderTeamMembers(members) {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;

    teamGrid.innerHTML = '';

    members.forEach((member, index) => {
        // Create member card
        const memberCard = document.createElement('div');
        memberCard.className = 'team-member-card';
        memberCard.dataset.id = member._id;

        // Get member avatar
        const memberAvatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`;

        // Get member role and department
        const memberRole = member.role || 'Team Member';
        const memberDepartment = member.department || '';

        // Build member card HTML with improved structure
        memberCard.innerHTML = `
            <div class="member-avatar">
                <img src="${memberAvatar}" alt="${member.name}" loading="lazy">
            </div>
            <div class="member-info">
                <h3 class="member-name">${member.name}</h3>
                <p class="member-role">${memberRole}</p>
            </div>
        `;

        // Add click event to select member
        memberCard.addEventListener('click', () => {
            console.log('Member card clicked for member:', member._id);

            // Deselect all other cards
            document.querySelectorAll('.team-member-card').forEach(card => {
                card.classList.remove('selected');
            });

            // Select this card
            memberCard.classList.add('selected');

            // Load member details
            selectTeamMember(member._id);
        });

        // Add a staggered entrance animation
        memberCard.style.opacity = '0';
        memberCard.style.transform = 'translateY(10px)';

        teamGrid.appendChild(memberCard);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            memberCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            memberCard.style.opacity = '1';
            memberCard.style.transform = 'translateY(0)';
        }, 30 + (index * 30));
    });

    // Auto-select the first member after rendering
    setTimeout(() => {
        const firstMemberCard = document.querySelector('.team-member-card');
        if (firstMemberCard) {
            firstMemberCard.classList.add('selected');
            const memberId = firstMemberCard.dataset.id;
            if (memberId) {
                selectTeamMember(memberId);
            }
        }
    }, 300); // Wait for animations to complete
}

// Function to select a team member
async function selectTeamMember(memberId) {
    console.log('Selecting team member:', memberId);

    // Highlight the selected member card
    const memberCards = document.querySelectorAll('.team-member-card');
    memberCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.id === memberId) {
            card.classList.add('selected');
        }
    });

    try {
        // Show loading state in member details sections
        showLoadingState();

        // Fetch member details
        const member = await fetchTeamMemberById(memberId);
        if (!member) {
            showNotification('Failed to load member details', 'error');
            showErrorState('Could not load member details');
            return;
        }

        console.log('Member details loaded successfully:', member);

        // Render member details
        renderMemberDetails(member);

        try {
            // Fetch and render member projects
            const projects = await fetchMemberProjects(memberId);
            renderMemberProjects(projects);
        } catch (projectError) {
            console.error('Error loading member projects:', projectError);
            const projectsSection = document.getElementById('member-projects');
            if (projectsSection) {
                projectsSection.innerHTML = `
                    <div class="empty-section error-section">
                        <i class="fas fa-project-diagram"></i>
                        <h4>No Projects Assigned</h4>
                        <p>This team member doesn't have any assigned projects yet.</p>
                    </div>
                `;
            }
            // Don't show the error notification for projects, handle it gracefully
        }

        try {
            // Fetch and render member tasks
            const tasks = await fetchMemberTasks(memberId);
            renderMemberTasks(tasks);
        } catch (taskError) {
            console.error('Error loading member tasks:', taskError);
            const tasksSection = document.getElementById('member-tasks');
            if (tasksSection) {
                tasksSection.innerHTML = `
                    <div class="empty-section error-section">
                        <i class="fas fa-tasks"></i>
                        <h4>No Tasks Available</h4>
                        <p>This team member doesn't have any assigned tasks yet.</p>
                    </div>
                `;
            }
            // Don't show the error notification for tasks, handle it gracefully
        }

        // Render member performance chart (async function)
        renderMemberPerformanceChart(member).catch(chartError => {
            console.error('Error rendering performance chart:', chartError);
            // Error handling is already in the renderMemberPerformanceChart function
        });

        // Make sure the Performance tab is active
        const performanceTabBtn = document.querySelector('.tab-btn[data-tab="performance"]');
        if (performanceTabBtn) {
            performanceTabBtn.click();
        }
    } catch (error) {
        console.error('Error loading member details:', error);
        showNotification('Failed to load member details', 'error');
        showErrorState('Could not load member details');
    }
}

// Function to show loading state in member details sections
function showLoadingState() {
    const sections = [
        'member-details',
        'member-projects',
        'member-tasks'
    ];

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.innerHTML = `
                <div class="loading-section">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading...</p>
                </div>
            `;
        }
    });

    // For the performance section
    const performanceSection = document.getElementById('member-performance');
    if (performanceSection) {
        performanceSection.innerHTML = `
            <div class="loading-section chart-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading performance data...</p>
            </div>
        `;
    }

    // Make sure the Performance tab is active
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === 'performance') {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === 'performance-tab') {
            pane.classList.add('active');
        }
    });
}

// Function to show error state in member details sections
function showErrorState(message) {
    const detailsSection = document.getElementById('member-details');
    if (detailsSection) {
        detailsSection.innerHTML = `
            <div class="empty-section error-section">
                <i class="fas fa-exclamation-circle"></i>
                <h4>Error</h4>
                <p>${message}</p>
            </div>
        `;
    }
}

// Function to render member details
function renderMemberDetails(member) {
    const memberDetailsSection = document.getElementById('member-details');
    if (!memberDetailsSection) return;

    // Get member avatar
    const memberAvatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`;

    // Format join date
    const joinDate = member.joinDate ? new Date(member.joinDate) : new Date();
    const joinDateFormatted = joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Calculate days since joining
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Build member details HTML with improved layout
    memberDetailsSection.innerHTML = `
        <div class="member-profile">
            <div class="member-avatar-large">
                <img src="${memberAvatar}" alt="${member.name}" loading="lazy">
            </div>
            <div class="member-profile-info">
                <h2 class="member-name">${member.name}</h2>
                <div class="member-role-badge">${member.role || 'Team Member'}</div>

                <div class="member-details-grid">
                    ${member.department ?
                        `<div class="detail-item">
                            <span class="detail-label"><i class="fas fa-building"></i> Department</span>
                            <span class="detail-value">${member.department}</span>
                        </div>` : ''}

                    ${member.email ?
                        `<div class="detail-item">
                            <span class="detail-label"><i class="fas fa-envelope"></i> Email</span>
                            <span class="detail-value"><a href="mailto:${member.email}">${member.email}</a></span>
                        </div>` : ''}

                    <div class="detail-item">
                        <span class="detail-label"><i class="fas fa-calendar-alt"></i> Joined</span>
                        <span class="detail-value">${joinDateFormatted} (${diffDays} days)</span>
                    </div>

                    ${member.skills && member.skills.length > 0 ?
                        `<div class="detail-item skills-item">
                            <span class="detail-label"><i class="fas fa-tools"></i> Skills</span>
                            <div class="skills-list">
                                ${member.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        </div>` : ''}
                </div>
            </div>
        </div>
        <div class="member-actions">
            <button type="button" class="team-action-btn edit-btn edit-member-btn" data-member-id="${member._id}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button type="button" class="team-action-btn assign-btn assign-project-btn" data-member-id="${member._id}">
                <i class="fas fa-project-diagram"></i> Assign Project
            </button>
            <button type="button" class="team-action-btn assign-btn assign-task-btn" data-member-id="${member._id}">
                <i class="fas fa-tasks"></i> Assign Task
            </button>
            <button type="button" class="team-action-btn delete-btn delete-member-btn" data-member-id="${member._id}">
                <i class="fas fa-trash-alt"></i> Delete
            </button>
        </div>
    `;

    // Add event listeners to buttons
    const editMemberBtn = memberDetailsSection.querySelector('.edit-member-btn');
    if (editMemberBtn) {
        editMemberBtn.addEventListener('click', function() {
            console.log('Edit member button clicked for member:', member._id);
            openEditMemberModal(member._id);
        });
    }

    const assignProjectBtn = memberDetailsSection.querySelector('.assign-project-btn');
    if (assignProjectBtn) {
        assignProjectBtn.addEventListener('click', function() {
            console.log('Assign project button clicked for member:', member._id);
            openAssignProjectModal(member._id);
        });
    }

    const assignTaskBtn = memberDetailsSection.querySelector('.assign-task-btn');
    if (assignTaskBtn) {
        assignTaskBtn.addEventListener('click', function() {
            console.log('Assign task button clicked for member:', member._id);
            openAssignTaskModal(member._id);
        });
    }

    // Add event listener for delete button
    const deleteMemberBtn = memberDetailsSection.querySelector('.delete-member-btn');
    if (deleteMemberBtn) {
        deleteMemberBtn.addEventListener('click', function() {
            console.log('Delete member button clicked for member:', member._id);
            openDeleteMemberConfirmation(member);
        });
    }
}

// Function to render member projects
function renderMemberProjects(projects) {
    const memberProjectsSection = document.getElementById('member-projects');
    if (!memberProjectsSection) return;

    if (!projects || projects.length === 0) {
        memberProjectsSection.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-project-diagram"></i>
                <h4>No Projects Assigned</h4>
                <p>This team member doesn't have any projects assigned yet.</p>
            </div>
        `;
        return;
    }

    let projectsHTML = '';
    projects.forEach(project => {
        // Format dates
        const startDate = project.startDate ? new Date(project.startDate) : new Date();
        const endDate = project.endDate ? new Date(project.endDate) : new Date();
        const startDateFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDateFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        projectsHTML += `
            <div class="project-item">
                <div class="project-header">
                    <h4 class="project-name">${project.name}</h4>
                    <span class="project-status ${project.status || 'not-started'}">${formatStatus(project.status || 'not-started')}</span>
                </div>
                <div class="project-progress">
                    <div class="progress-header">
                        <span class="progress-label">Progress</span>
                        <span class="progress-value">${project.progress || 0}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                    </div>
                </div>
                <div class="project-dates">
                    <span>${startDateFormatted}</span>
                    <span>${endDateFormatted}</span>
                </div>
                <a href="projects.html?id=${project._id}" class="view-project-link">
                    <i class="fas fa-external-link-alt"></i> View Project
                </a>
            </div>
        `;
    });

    memberProjectsSection.innerHTML = projectsHTML;
}

// Function to render member tasks
function renderMemberTasks(tasks) {
    const memberTasksSection = document.getElementById('member-tasks');
    if (!memberTasksSection) return;

    if (!tasks || tasks.length === 0) {
        memberTasksSection.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-tasks"></i>
                <h4>No Tasks Assigned</h4>
                <p>This team member doesn't have any tasks assigned yet.</p>
            </div>
        `;
        return;
    }

    let tasksHTML = '';
    tasks.forEach(task => {
        // Format due date
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const dueDateFormatted = dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';

        // Calculate days remaining
        let daysRemaining = '';
        if (dueDate) {
            const today = new Date();
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                daysRemaining = `<span class="overdue">Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}</span>`;
            } else if (diffDays === 0) {
                daysRemaining = `<span class="due-today">Due today</span>`;
            } else {
                daysRemaining = `<span class="days-remaining">${diffDays} day${diffDays !== 1 ? 's' : ''} remaining</span>`;
            }
        }

        tasksHTML += `
            <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
                <div class="task-header">
                    <h4 class="task-name">${task.name}</h4>
                    <span class="task-status ${task.status || 'not-started'}">${formatStatus(task.status || 'not-started')}</span>
                </div>
                <p class="task-description">${task.description || 'No description provided.'}</p>
                <div class="task-meta">
                    <div class="task-due-date">
                        <i class="fas fa-calendar-alt"></i> ${dueDateFormatted}
                        ${daysRemaining}
                    </div>
                    <div class="task-priority ${task.priority || 'medium'}">
                        <i class="fas fa-flag"></i> ${formatPriority(task.priority || 'medium')}
                    </div>
                </div>
                <a href="tasks.html?id=${task._id}" class="view-task-link">
                    <i class="fas fa-external-link-alt"></i> View Task
                </a>
            </div>
        `;
    });

    memberTasksSection.innerHTML = tasksHTML;
}

// Function to render member performance chart
async function renderMemberPerformanceChart(member) {
    try {
        // Get the performance section
        const performanceSection = document.getElementById('member-performance');
        if (!performanceSection) return;

        // Show loading state
        performanceSection.innerHTML = `
            <div class="loading-section chart-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading performance data...</p>
            </div>
        `;

        // Fetch real performance data from the API
        const performanceData = await fetchMemberPerformance(member._id);

        if (!performanceData) {
            performanceSection.innerHTML = `
                <div class="empty-section">
                    <i class="fas fa-chart-line"></i>
                    <h4>No Performance Data Available</h4>
                    <p>There is no performance data available for this team member yet.</p>
                </div>
            `;
            return;
        }

        // Create the performance dashboard with multiple sections
        performanceSection.innerHTML = `
            <div class="performance-dashboard">
                <div class="performance-chart-container">
                    <h3>Weekly Performance</h3>
                    <canvas id="member-performance-chart"></canvas>
                </div>
                <div class="performance-metrics">
                    <div class="metrics-section">
                        <h3>Task Metrics</h3>
                        <div class="metrics-grid">
                            <div class="metric-item">
                                <div class="metric-value">${performanceData.taskMetrics.total}</div>
                                <div class="metric-label">Total Tasks</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">${performanceData.taskMetrics.completed}</div>
                                <div class="metric-label">Completed</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">${performanceData.taskMetrics.inProgress}</div>
                                <div class="metric-label">In Progress</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">${performanceData.taskMetrics.completionRate}%</div>
                                <div class="metric-label">Completion Rate</div>
                            </div>
                        </div>
                    </div>
                    ${performanceData.projectContributions && performanceData.projectContributions.length > 0 ? `
                    <div class="metrics-section">
                        <h3>Project Contributions</h3>
                        <div class="project-contributions">
                            ${performanceData.projectContributions.map(project => `
                                <div class="project-contribution">
                                    <div class="project-name">${project.name}</div>
                                    <div class="contribution-bar">
                                        <div class="contribution-fill" style="width: ${project.contribution}%"></div>
                                    </div>
                                    <div class="contribution-value">${project.contribution}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Get the canvas element
        const chartCanvas = document.getElementById('member-performance-chart');
        if (!chartCanvas) {
            console.error('Could not find chart canvas');
            return;
        }

        // Check if Chart is defined
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            const chartContainer = chartCanvas.parentElement;
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div class="chart-error">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Unable to load performance chart</p>
                    </div>
                `;
            }
            return;
        }

        // Extract data for the chart
        const labels = performanceData.weeklyData.map(week => week.label);
        const tasksCompletedData = performanceData.weeklyData.map(week => week.tasksCompleted);
        const hoursWorkedData = performanceData.weeklyData.map(week => week.hoursWorked);

        // Create the chart
        new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Tasks Completed',
                        data: tasksCompletedData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Hours Worked',
                        data: hoursWorkedData,
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
    } catch (error) {
        console.error('Error rendering performance chart:', error);
        const performanceSection = document.getElementById('member-performance');
        if (performanceSection) {
            performanceSection.innerHTML = `
                <div class="chart-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Unable to load performance chart: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Function to open create member modal
function openCreateMemberModal() {
    console.log('Opening create member modal');

    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'createMemberModal';

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Team Member</h2>
                <button type="button" class="close-btn" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
                <p class="form-instructions">Fields marked with <span class="required-field">*</span> are required.</p>
                <form id="createMemberForm">
                    <div class="form-group">
                        <label for="memberName">Name <span class="required-field">*</span></label>
                        <input type="text" id="memberName" name="name" required placeholder="Enter member name">
                    </div>
                    <div class="form-group">
                        <label for="memberEmail">Email <span class="optional-field">(Optional)</span></label>
                        <input type="email" id="memberEmail" name="email" placeholder="Enter member email">
                    </div>
                    <div class="form-group">
                        <label for="memberRole">Role <span class="optional-field">(Optional)</span></label>
                        <input type="text" id="memberRole" name="role" placeholder="Enter member role">
                    </div>
                    <div class="form-group">
                        <label for="memberSkills">Skills <span class="optional-field">(Optional, comma separated)</span></label>
                        <input type="text" id="memberSkills" name="skills" placeholder="Enter skills">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="button" class="submit-btn">Add Member</button>
            </div>
        </div>
    `;

    // Add modal to DOM
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => {
        backdrop.classList.add('show');
        modal.classList.add('show');
    }, 10);

    // Add event listeners
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const submitBtn = modal.querySelector('.submit-btn');
    const form = modal.querySelector('#createMemberForm');

    // Close modal when clicking close button or cancel button
    closeBtn.addEventListener('click', () => closeModal(modal, backdrop));
    cancelBtn.addEventListener('click', () => closeModal(modal, backdrop));

    // Close modal when clicking outside
    backdrop.addEventListener('click', () => closeModal(modal, backdrop));

    // Prevent closing when clicking on modal content
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Handle form submission
    submitBtn.addEventListener('click', async () => {
        // Get form data
        const name = form.querySelector('#memberName').value.trim();
        const email = form.querySelector('#memberEmail').value.trim();
        const role = form.querySelector('#memberRole').value.trim();
        const skillsInput = form.querySelector('#memberSkills').value.trim();
        const skills = skillsInput ? skillsInput.split(',').map(skill => skill.trim()) : [];

        // Validate form
        if (!name) {
            showNotification('Please enter a name for the team member', 'error');
            return;
        }

        // Disable submit button to prevent multiple submissions
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Adding...';

        // Create member data
        const memberData = {
            name,
            email,
            role,
            skills
        };

        try {
            // Create member
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });

            if (!response.ok) {
                throw new Error('Failed to create team member');
            }

            const newMember = await response.json();

            // Show success notification
            showNotification(`Team member "${name}" added successfully`, 'success');

            // Close modal
            closeModal(modal, backdrop);

            // Reload team members list
            loadTeamMembersList();
        } catch (error) {
            console.error('Error creating team member:', error);
            showNotification('Failed to add team member', 'error');

            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Member';
        }
    });
}

// Function to open delete member confirmation dialog
function openDeleteMemberConfirmation(member) {
    console.log('Opening delete member confirmation for member:', member._id);

    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'deleteMemberModal';

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Delete Team Member</h2>
                <button type="button" class="close-btn" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="delete-confirmation">
                    <i class="fas fa-exclamation-triangle warning-icon"></i>
                    <p>Are you sure you want to delete <strong>${member.name}</strong>?</p>
                    <p class="warning-text">This action cannot be undone. All associated data will be permanently removed.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="button" class="delete-btn">Delete</button>
            </div>
        </div>
    `;

    // Add modal to DOM
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => {
        backdrop.classList.add('show');
        modal.classList.add('show');
    }, 10);

    // Add event listeners
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const deleteBtn = modal.querySelector('.delete-btn');

    // Close modal when clicking close button or cancel button
    closeBtn.addEventListener('click', () => closeModal(modal, backdrop));
    cancelBtn.addEventListener('click', () => closeModal(modal, backdrop));

    // Close modal when clicking outside
    backdrop.addEventListener('click', () => closeModal(modal, backdrop));

    // Prevent closing when clicking on modal content
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Handle delete button click
    deleteBtn.addEventListener('click', async () => {
        // Disable delete button to prevent multiple clicks
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

        try {
            // Delete the member
            const success = await deleteUser(member._id);

            if (success) {
                // Close modal
                closeModal(modal, backdrop);

                // Reload team members list
                loadTeamMembersList();

                // Clear member details
                clearMemberDetails();
            } else {
                // Re-enable delete button
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = 'Delete';
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            showNotification('Failed to delete team member', 'error');

            // Re-enable delete button
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = 'Delete';
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
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
        if (document.body.contains(backdrop)) {
            document.body.removeChild(backdrop);
        }
    }, 300);
}

// Function to load team members list
async function loadTeamMembersList() {
    // Show loading state in the team grid
    const teamGrid = document.getElementById('team-grid');
    if (teamGrid) {
        teamGrid.innerHTML = `
            <div class="loading-section full-width">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading team members...</p>
            </div>
        `;
    }

    try {
        // Fetch team members with retry logic
        let members = [];
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                members = await fetchTeamMembers();
                if (members && members.length > 0) {
                    break; // Success, exit retry loop
                }
                retryCount++;
                console.log(`Retry ${retryCount}/${maxRetries} for fetching team members...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            } catch (retryError) {
                retryCount++;
                console.error(`Retry ${retryCount}/${maxRetries} failed:`, retryError);
                if (retryCount >= maxRetries) throw retryError;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
        }

        // Store members in global variable for filtering and sorting
        window.teamMembers = members;

        // Check if we have members
        if (!members || members.length === 0) {
            if (teamGrid) {
                teamGrid.innerHTML = `
                    <div class="empty-section">
                        <i class="fas fa-users"></i>
                        <h4>No Team Members Found</h4>
                        <p>There are no team members available. Add a new team member to get started.</p>
                        <button type="button" class="btn btn-primary mt-3" id="add-first-member">
                            <i class="fas fa-plus"></i> Add Team Member
                        </button>
                    </div>
                `;

                // Add event listener to the button
                const addButton = document.getElementById('add-first-member');
                if (addButton) {
                    addButton.addEventListener('click', openCreateMemberModal);
                }
            }
            return;
        }

        // Filter and sort members
        filterAndSortTeamMembers();

        // Clear any selected member details if no member is selected
        const selectedMemberCard = document.querySelector('.team-member-card.selected');
        if (!selectedMemberCard) {
            clearMemberDetails();
        }
    } catch (error) {
        console.error('Error loading team members list:', error);
        showNotification('Failed to load team members', 'error');

        if (teamGrid) {
            teamGrid.innerHTML = `
                <div class="empty-section error-section">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>Failed to Load Team Members</h4>
                    <p>There was a problem loading the team members. Please try again.</p>
                    <button type="button" class="btn btn-primary mt-3" id="retry-load-members">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            `;

            // Add event listener to the retry button
            const retryButton = document.getElementById('retry-load-members');
            if (retryButton) {
                retryButton.addEventListener('click', loadTeamMembersList);
            }
        }
    }
}

// Function to clear member details
function clearMemberDetails() {
    // Clear member details section
    const memberDetailsSection = document.getElementById('member-details');
    if (memberDetailsSection) {
        memberDetailsSection.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-user"></i>
                <h4>No Member Selected</h4>
                <p>Select a team member from the list to view their details.</p>
            </div>
        `;
    }

    // Clear projects section
    const projectsSection = document.getElementById('member-projects');
    if (projectsSection) {
        projectsSection.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-project-diagram"></i>
                <h4>No Projects Available</h4>
                <p>Select a team member to view their assigned projects.</p>
            </div>
        `;
    }

    // Clear tasks section
    const tasksSection = document.getElementById('member-tasks');
    if (tasksSection) {
        tasksSection.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-tasks"></i>
                <h4>No Tasks Available</h4>
                <p>Select a team member to view their current tasks.</p>
            </div>
        `;
    }

    // For the chart section
    const performanceSection = document.getElementById('member-performance');
    if (performanceSection) {
        performanceSection.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-chart-line"></i>
                <h4>No Performance Data</h4>
                <p>Select a team member to view their performance metrics.</p>
            </div>
        `;
    }

    // Make sure the Performance tab is active by default
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === 'performance') {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === 'performance-tab') {
            pane.classList.add('active');
        }
    });
}

// Function to open edit member modal
function openEditMemberModal(memberId) {
    console.log('Opening edit member modal for member:', memberId);

    // Fetch member data
    fetchTeamMemberById(memberId).then(member => {
        if (!member) {
            showNotification('Failed to load member details', 'error');
            return;
        }

        // Create modal elements
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'editMemberModal';

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Team Member</h2>
                    <button type="button" class="close-btn" aria-label="Close modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="form-instructions">Fields marked with <span class="required-field">*</span> are required.</p>
                    <form id="editMemberForm">
                        <div class="form-group">
                            <label for="memberName">Name <span class="required-field">*</span></label>
                            <input type="text" id="memberName" name="name" required placeholder="Enter member name" value="${member.name || ''}">
                        </div>
                        <div class="form-group">
                            <label for="memberEmail">Email <span class="optional-field">(Optional)</span></label>
                            <input type="email" id="memberEmail" name="email" placeholder="Enter member email" value="${member.email || ''}">
                        </div>
                        <div class="form-group">
                            <label for="memberRole">Role <span class="optional-field">(Optional)</span></label>
                            <input type="text" id="memberRole" name="role" placeholder="Enter member role" value="${member.role || ''}">
                        </div>
                        <div class="form-group">
                            <label for="memberSkills">Skills <span class="optional-field">(Optional, comma separated)</span></label>
                            <input type="text" id="memberSkills" name="skills" placeholder="Enter skills" value="${member.skills ? member.skills.join(', ') : ''}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="cancel-btn">Cancel</button>
                    <button type="button" class="submit-btn">Update Member</button>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        // Show modal with animation
        setTimeout(() => {
            backdrop.classList.add('show');
            modal.classList.add('show');
        }, 10);

        // Add event listeners
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const submitBtn = modal.querySelector('.submit-btn');
        const form = modal.querySelector('#editMemberForm');

        // Close modal when clicking close button or cancel button
        closeBtn.addEventListener('click', () => closeModal(modal, backdrop));
        cancelBtn.addEventListener('click', () => closeModal(modal, backdrop));

        // Close modal when clicking outside
        backdrop.addEventListener('click', () => closeModal(modal, backdrop));

        // Prevent closing when clicking on modal content
        modal.addEventListener('click', (e) => e.stopPropagation());

        // Handle form submission
        submitBtn.addEventListener('click', async () => {
            // Get form data
            const name = form.querySelector('#memberName').value.trim();
            const email = form.querySelector('#memberEmail').value.trim();
            const role = form.querySelector('#memberRole').value.trim();
            const skillsInput = form.querySelector('#memberSkills').value.trim();
            const skills = skillsInput ? skillsInput.split(',').map(skill => skill.trim()) : [];

            // Validate form
            if (!name) {
                showNotification('Please enter a name for the team member', 'error');
                return;
            }

            // Disable submit button to prevent multiple submissions
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Updating...';

            // Create member data
            const memberData = {
                name,
                email,
                role,
                skills
            };

            try {
                // Update member
                const response = await fetch(`/api/users/${memberId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(memberData)
                });

                if (!response.ok) {
                    throw new Error('Failed to update team member');
                }

                const updatedMember = await response.json();

                // Show success notification
                showNotification(`Team member "${name}" updated successfully`, 'success');

                // Close modal
                closeModal(modal, backdrop);

                // Reload team members list
                loadTeamMembersList();

                // If the member was selected, reload the member details
                const selectedMemberCard = document.querySelector('.team-member-card.selected');
                if (selectedMemberCard && selectedMemberCard.dataset.id === memberId) {
                    selectTeamMember(memberId);
                }
            } catch (error) {
                console.error('Error updating team member:', error);
                showNotification('Failed to update team member', 'error');

                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Update Member';
            }
        });
    });
}

// Function to open assign project modal
function openAssignProjectModal(memberId) {
    console.log('Opening assign project modal for member:', memberId);
    // Implementation will be added later
    showNotification('Assign project functionality will be implemented soon', 'info');
}

// Function to open assign task modal
function openAssignTaskModal(memberId) {
    console.log('Opening assign task modal for member:', memberId);
    // Implementation will be added later
    showNotification('Assign task functionality will be implemented soon', 'info');
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

// Function to format priority text
function formatPriority(priority) {
    switch (priority) {
        case 'high':
            return 'High';
        case 'medium':
            return 'Medium';
        case 'low':
            return 'Low';
        default:
            return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
}

// Function to fetch team members
async function fetchTeamMembers() {
    try {
        console.log('Fetching team members from API...');
        // Make a direct API call to ensure we're getting the data
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Failed to fetch team members');
        }
        const members = await response.json();
        console.log('Team members fetched successfully:', members);
        return members;
    } catch (error) {
        console.error('Error fetching team members:', error);
        showNotification('Failed to load team members', 'error');
        return [];
    }
}

// Function to fetch team member by ID
async function fetchTeamMemberById(memberId) {
    try {
        // Make a direct API call to ensure we're getting the data
        const response = await fetch(`/api/users/${memberId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch team member');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching team member:', error);
        showNotification('Failed to load team member details', 'error');
        return null;
    }
}

// Function to fetch member projects
async function fetchMemberProjects(memberId) {
    try {
        // Make a direct API call to ensure we're getting the data
        const response = await fetch(`/api/users/${memberId}/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch member projects');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching member projects:', error);
        // Don't show notification for project loading errors
        // We'll handle this in the UI with a more graceful message
        return [];
    }
}

// Function to fetch member tasks
async function fetchMemberTasks(memberId) {
    try {
        // Make a direct API call to ensure we're getting the data
        const response = await fetch(`/api/users/${memberId}/tasks`);
        if (!response.ok) {
            throw new Error('Failed to fetch member tasks');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching member tasks:', error);
        // Don't show notification for task loading errors
        // We'll handle this in the UI with a more graceful message
        return [];
    }
}
