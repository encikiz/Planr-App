// Team page functionality using database data
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeTeamPage();

    // Set up tab functionality
    setupTabsEventListeners();

    // Check for hash fragments for quick actions
    checkForQuickActions();
});

// Initialize the team page
async function initializeTeamPage() {
    // Show loading overlay
    showLoadingOverlay();

    try {
        // Load current user
        const user = await loadCurrentUser();

        // Store current user in global variable for use in other functions
        window.currentUser = user;

        // Load team members
        await loadTeamMembers();

        // Load teams list
        await loadTeamsList();

        // Set up team buttons event listeners
        setupTeamButtonsEventListeners();

        // Hide loading overlay
        hideLoadingOverlay();

        // Expose tab switching function globally for debugging
        window.switchToTab = function(tabId) {
            console.log('Manual tab switch requested to:', tabId);
            switchTab(tabId);
        };

        // Expose loadTeamsList function globally
        window.loadTeamsList = loadTeamsList;

        console.log('Tab switching debug function available. Use switchToTab("teams") or switchToTab("members") to test tab switching.');
        console.log('Team list loading function exposed globally. Use loadTeamsList() to reload the teams list.');
    } catch (error) {
        console.error('Error initializing team page:', error);
        showNotification('Failed to load team data', 'error');
        hideLoadingOverlay();
    }
}

// Function to set up team buttons event listeners
function setupTeamButtonsEventListeners() {
    console.log('Setting up team buttons event listeners');

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

// Function to load team members
async function loadTeamMembers() {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;

    teamGrid.innerHTML = '';

    try {
        // Fetch team members from API
        const teamMembers = await fetchTeamMembers();

        if (teamMembers.length === 0) {
            teamGrid.innerHTML = `
                <div class="empty-section">
                    <i class="fas fa-users"></i>
                    <h4>No Team Members</h4>
                    <p>There are no team members in the system yet.</p>
                </div>
            `;
            return;
        }

        // Apply filters and sorting
        const filteredMembers = filterAndSortTeamMembers(teamMembers);

        // Render team members
        renderTeamMembers(filteredMembers);

        // Load the first team member by default
        if (filteredMembers.length > 0) {
            loadMemberDetails(filteredMembers[0]._id);
        } else {
            showEmptyMemberDetails();
        }
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

// Function to fetch team members from API
async function fetchTeamMembers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Failed to fetch team members');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching team members:', error);
        throw error;
    }
}

// Function to filter and sort team members
function filterAndSortTeamMembers(teamMembers) {
    // Get filter values
    const searchTerm = document.getElementById('team-search')?.value.toLowerCase() || '';
    const departmentFilter = document.getElementById('department-filter')?.value || 'all';
    const sortBy = document.getElementById('sort-by')?.value || 'name-asc';

    // Filter team members
    let filteredMembers = teamMembers.filter(member => {
        // Search filter
        const matchesSearch =
            member.name.toLowerCase().includes(searchTerm) ||
            (member.email && member.email.toLowerCase().includes(searchTerm)) ||
            (member.role && member.role.toLowerCase().includes(searchTerm));

        // Department filter (if we had department data)
        const matchesDepartment = departmentFilter === 'all' ||
            (member.department && member.department === departmentFilter);

        return matchesSearch && matchesDepartment;
    });

    // Sort team members
    switch(sortBy) {
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
        default:
            filteredMembers.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filteredMembers;
}

// Function to render team members
function renderTeamMembers(teamMembers) {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;

    teamGrid.innerHTML = '';

    teamMembers.forEach((member, index) => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.dataset.id = member._id;

        // Add department color indicator (if we had department data)
        const departmentClass = member.department ?
            `department-${member.department.replace(/\s+/g, '')}` : '';

        // Determine online status randomly for demo purposes
        const statusOptions = ['online', 'offline', 'busy'];
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        // Count projects and tasks for this member
        const projectCount = Math.floor(Math.random() * 5); // For demo purposes
        const taskCount = Math.floor(Math.random() * 8); // For demo purposes

        teamCard.innerHTML = `
            <div class="department-indicator ${departmentClass}"></div>
            <div class="member-avatar">
                <img src="${member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}" alt="${member.name}">
            </div>
            <div class="member-info">
                <h4 class="member-name">${member.name}</h4>
                <p class="member-role">${member.role || 'Team Member'}</p>
                <span class="member-department">${member.department || ''}</span>
                <div class="member-stats">
                    <span class="stat-item"><i class="fas fa-project-diagram"></i> ${projectCount} projects</span>
                    <span class="stat-item"><i class="fas fa-tasks"></i> ${taskCount} tasks</span>
                </div>
            </div>
            <div class="member-status ${randomStatus}" title="${randomStatus.charAt(0).toUpperCase() + randomStatus.slice(1)}"></div>
        `;

        // Add click event to show member details
        teamCard.addEventListener('click', () => {
            loadMemberDetails(member._id);
        });

        // Add a staggered entrance animation
        teamCard.style.opacity = '0';
        teamCard.style.transform = 'translateY(10px)';

        teamGrid.appendChild(teamCard);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            teamCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            teamCard.style.opacity = '1';
            teamCard.style.transform = 'translateY(0)';
        }, 30 + (index * 30));
    });
}

// Function to load member details
async function loadMemberDetails(memberId) {
    try {
        // Fetch member details
        const member = await fetchTeamMemberById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        // Highlight the selected team card
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => {
            card.classList.remove('selected');
            card.classList.remove('active');
            if (card.dataset.id === memberId) {
                card.classList.add('selected');
                card.classList.add('active');
            }
        });

        // Render member details
        renderMemberDetails(member);

        // Fetch and render member projects
        const projects = await fetchMemberProjects(memberId);
        renderMemberProjects(member, projects);

        // Fetch and render member tasks
        const tasks = await fetchMemberTasks(memberId);
        renderMemberTasks(member, tasks);

        // Render member performance chart
        renderMemberPerformance(member, tasks);
    } catch (error) {
        console.error('Error loading member details:', error);
        showNotification('Failed to load member details', 'error');
    }
}

// Function to fetch team member by ID
async function fetchTeamMemberById(memberId) {
    try {
        const response = await fetch(`/api/users/${memberId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch team member');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching team member:', error);
        throw error;
    }
}

// Function to fetch member projects
async function fetchMemberProjects(memberId) {
    try {
        // Fetch all projects
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();

        // Filter projects that have this member in teamMembers
        return projects.filter(project =>
            project.teamMembers &&
            project.teamMembers.some(member =>
                member._id === memberId ||
                (typeof member === 'string' && member === memberId)
            )
        );
    } catch (error) {
        console.error('Error fetching member projects:', error);
        return [];
    }
}

// Function to fetch member tasks
async function fetchMemberTasks(memberId) {
    try {
        // Fetch all tasks
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();

        // Filter tasks assigned to this member
        return tasks.filter(task =>
            task.assignedTo &&
            task.assignedTo.some(assignee =>
                assignee._id === memberId ||
                (typeof assignee === 'string' && assignee === memberId)
            )
        );
    } catch (error) {
        console.error('Error fetching member tasks:', error);
        return [];
    }
}

// Function to render member details
function renderMemberDetails(member) {
    const memberDetailsContainer = document.getElementById('member-details');
    if (!memberDetailsContainer) return;

    memberDetailsContainer.innerHTML = '';

    // Create the member profile element
    const memberProfile = document.createElement('div');
    memberProfile.className = 'member-profile';

    // Create department class for styling (if we had department data)
    const departmentClass = member.department ?
        `department-${member.department.replace(/\s+/g, '')}`.toLowerCase() : '';

    // Calculate member statistics for demo purposes
    const completedTasks = Math.floor(Math.random() * 20);
    const totalTasks = completedTasks + Math.floor(Math.random() * 10);
    const projectsCount = Math.floor(Math.random() * 5);

    // Format join date
    const joinDate = member.createdAt ? new Date(member.createdAt) : new Date();
    const joinDateFormatted = joinDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    memberProfile.innerHTML = `
        <div class="member-avatar">
            <img src="${member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`}" alt="${member.name}">
        </div>
        <div class="member-info">
            <h3>${member.name}</h3>
            <div class="member-role">${member.role || 'Team Member'}</div>
            ${member.department ? `<div class="department-badge ${departmentClass}">${member.department}</div>` : ''}

            <div class="member-stats">
                <div class="stat-item">
                    <div class="stat-value">${completedTasks}</div>
                    <div class="stat-label">Tasks Completed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${projectsCount}</div>
                    <div class="stat-label">Projects</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
            </div>

            <div class="member-contact-info">
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <a href="mailto:${member.email}">${member.email}</a>
                </div>
                <div class="contact-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Joined ${joinDateFormatted}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-user-tag"></i>
                    <span>${member.role || 'Team Member'}</span>
                </div>
            </div>
        </div>
    `;

    // Add animation
    memberProfile.style.opacity = '0';
    memberProfile.style.transform = 'translateY(10px)';
    memberDetailsContainer.appendChild(memberProfile);

    // Trigger animation
    setTimeout(() => {
        memberProfile.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        memberProfile.style.opacity = '1';
        memberProfile.style.transform = 'translateY(0)';
    }, 100);
}

// Function to render member projects
function renderMemberProjects(member, projects) {
    const memberProjects = document.getElementById('member-projects');
    if (!memberProjects) return;

    memberProjects.innerHTML = '';

    if (!projects || projects.length === 0) {
        memberProjects.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-project-diagram"></i>
                <h4>No Projects Assigned</h4>
                <p>This team member is not currently assigned to any projects.</p>
            </div>
        `;
        return;
    }

    // Sort projects by progress
    const sortedProjects = [...projects].sort((a, b) => b.progress - a.progress);

    sortedProjects.forEach((project, index) => {
        const priorityClass = project.priority || 'medium';

        const projectItem = document.createElement('div');
        projectItem.className = `project-item ${priorityClass}`;

        // Calculate progress bar width
        const progressWidth = project.progress + '%';

        // Determine status text and icon
        let statusText, statusIcon;
        if (project.status === 'completed') {
            statusText = 'Completed';
            statusIcon = 'fa-check-circle';
        } else if (project.status === 'in-progress') {
            statusText = 'In Progress';
            statusIcon = 'fa-spinner';
        } else if (project.status === 'planning') {
            statusText = 'Planning';
            statusIcon = 'fa-clipboard-list';
        } else {
            statusText = 'Not Started';
            statusIcon = 'fa-clock';
        }

        // Format dates
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        const startDateFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDateFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Calculate days remaining
        const today = new Date();
        const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        const daysRemainingText = daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue';

        projectItem.innerHTML = `
            <div class="project-header">
                <span class="project-name">${project.name}</span>
                <span class="project-progress-value">${project.progress}%</span>
            </div>
            <div class="project-meta">
                <span class="project-status"><i class="fas ${statusIcon}"></i> ${statusText}</span>
                <span class="project-dates">${startDateFormatted} - ${endDateFormatted}</span>
            </div>
            <div class="project-progress">
                <div class="project-progress-bar">
                    <div class="progress-bar-fill ${priorityClass}" style="width: ${progressWidth}"></div>
                </div>
            </div>
            <div class="project-footer">
                <span class="project-priority ${priorityClass}">
                    <i class="fas fa-flag"></i> ${priorityClass.charAt(0).toUpperCase() + priorityClass.slice(1)}
                </span>
                <span class="project-deadline ${daysRemaining < 0 ? 'overdue' : daysRemaining < 3 ? 'urgent' : ''}">
                    <i class="fas ${daysRemaining < 0 ? 'fa-exclamation-circle' : 'fa-calendar-alt'}"></i> ${daysRemainingText}
                </span>
            </div>
        `;

        // Add a staggered entrance animation
        projectItem.style.opacity = '0';
        projectItem.style.transform = 'translateY(10px)';

        memberProjects.appendChild(projectItem);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            projectItem.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            projectItem.style.opacity = '1';
            projectItem.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });
}

// Function to render member tasks
function renderMemberTasks(member, tasks) {
    const memberTasks = document.getElementById('member-tasks');
    if (!memberTasks) return;

    memberTasks.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        memberTasks.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-tasks"></i>
                <h4>No Tasks Assigned</h4>
                <p>This team member doesn't have any tasks assigned at the moment.</p>
            </div>
        `;
        return;
    }

    // Sort tasks by status and due date
    const sortedTasks = [...tasks].sort((a, b) => {
        const statusOrder = { 'in-progress': 1, 'not-started': 2, 'completed': 3 };

        // First sort by status
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }

        // Then sort by due date
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    // Only show up to 5 most recent tasks
    const recentTasks = sortedTasks.slice(0, 5);

    // Add task summary
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const notStartedTasks = tasks.filter(task => task.status === 'not-started').length;
    const overdueTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return task.status !== 'completed' && dueDate < today;
    }).length;

    const taskSummary = document.createElement('div');
    taskSummary.className = 'task-summary';
    taskSummary.innerHTML = `
        <div class="summary-header">
            <h4>Task Summary</h4>
            <span class="total-tasks">${totalTasks} total tasks</span>
        </div>
        <div class="summary-stats">
            <div class="stat-pill completed">
                <i class="fas fa-check-circle"></i> ${completedTasks} Completed
            </div>
            <div class="stat-pill in-progress">
                <i class="fas fa-spinner"></i> ${inProgressTasks} In Progress
            </div>
            <div class="stat-pill not-started">
                <i class="fas fa-clock"></i> ${notStartedTasks} Not Started
            </div>
            ${overdueTasks > 0 ? `<div class="stat-pill overdue">
                <i class="fas fa-exclamation-circle"></i> ${overdueTasks} Overdue
            </div>` : ''}
        </div>
    `;
    memberTasks.appendChild(taskSummary);

    // Create task list container
    const taskList = document.createElement('div');
    taskList.className = 'task-list';
    memberTasks.appendChild(taskList);

    recentTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.status}`;

        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const isOverdue = task.status !== 'completed' && dueDate < today;

        if (isOverdue) {
            taskItem.classList.add('overdue');
        }

        // Get status icon and text
        let statusIcon, statusText;
        switch(task.status) {
            case 'completed':
                statusIcon = 'fa-check-circle';
                statusText = 'Completed';
                break;
            case 'in-progress':
                statusIcon = 'fa-spinner';
                statusText = 'In Progress';
                break;
            default:
                statusIcon = 'fa-clock';
                statusText = 'Not Started';
        }

        // Calculate days remaining
        const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        let daysText = '';
        if (task.status === 'completed') {
            daysText = 'Completed';
        } else if (daysRemaining < 0) {
            daysText = `${Math.abs(daysRemaining)} days overdue`;
        } else if (daysRemaining === 0) {
            daysText = 'Due today';
        } else if (daysRemaining === 1) {
            daysText = 'Due tomorrow';
        } else {
            daysText = `${daysRemaining} days left`;
        }

        // Get project name if available
        const projectName = task.projectId && typeof task.projectId === 'object' ?
            task.projectId.name : 'Unknown Project';

        // Calculate progress bar width
        const progressWidth = task.progress ? task.progress + '%' : '0%';

        taskItem.innerHTML = `
            <div class="task-header">
                <span class="task-name">${task.name}</span>
                <span class="task-project">${projectName}</span>
            </div>
            <div class="task-progress">
                <div class="task-progress-bar">
                    <div class="progress-bar-fill ${task.priority || 'medium'}" style="width: ${progressWidth}"></div>
                </div>
            </div>
            <div class="task-details">
                <span class="task-status"><i class="fas ${statusIcon}"></i> ${statusText}</span>
                <span class="task-due ${isOverdue ? 'overdue' : ''}">
                    <i class="fas ${isOverdue ? 'fa-exclamation-circle' : 'fa-calendar-alt'}"></i>
                    ${formatDate(task.dueDate)}
                </span>
            </div>
            <div class="task-footer">
                <span class="task-priority ${task.priority || 'medium'}">
                    <i class="fas fa-flag"></i> ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                </span>
                <span class="task-days ${isOverdue ? 'overdue' : daysRemaining < 2 ? 'urgent' : ''}">
                    <i class="fas fa-hourglass-half"></i> ${daysText}
                </span>
            </div>
        `;

        // Add a staggered entrance animation
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateY(10px)';

        taskList.appendChild(taskItem);

        // Trigger the animation with a staggered delay
        setTimeout(() => {
            taskItem.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            taskItem.style.opacity = '1';
            taskItem.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });

    // Add 'View All Tasks' button if there are more than 5 tasks
    if (tasks.length > 5) {
        const viewAllBtn = document.createElement('button');
        viewAllBtn.className = 'view-all-btn';
        viewAllBtn.innerHTML = `<i class="fas fa-list"></i> View All ${tasks.length} Tasks`;
        viewAllBtn.addEventListener('click', () => {
            // This would typically navigate to a tasks page filtered for this member
            // For now, just show a notification
            showNotification('This would navigate to all tasks for this member', 'info');
        });
        memberTasks.appendChild(viewAllBtn);
    }
}

// Function to render member performance chart
function renderMemberPerformance(member, tasks) {
    const performanceSection = document.querySelector('.performance-section .section-content');
    if (!performanceSection) return;

    // Calculate performance metrics
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'not-started').length;
    const totalTasks = tasks.length;

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Create performance metrics container
    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'performance-metrics';
    metricsContainer.innerHTML = `
        <div class="completion-rate">
            <div class="rate-circle">
                <div class="rate-value">${completionRate}%</div>
                <div class="rate-label">Completion Rate</div>
            </div>
        </div>
        <div class="performance-stats">
            <div class="stat-item">
                <div class="stat-value">${completedTasks}</div>
                <div class="stat-label">Completed</div>
                <div class="stat-progress">
                    <div class="stat-bar" style="width: ${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${inProgressTasks}</div>
                <div class="stat-label">In Progress</div>
                <div class="stat-progress">
                    <div class="stat-bar" style="width: ${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%"></div>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${pendingTasks}</div>
                <div class="stat-label">Not Started</div>
                <div class="stat-progress">
                    <div class="stat-bar" style="width: ${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%"></div>
                </div>
            </div>
        </div>
    `;

    // Add metrics container to the performance section
    performanceSection.innerHTML = '';
    performanceSection.appendChild(metricsContainer);

    // Create canvas for chart
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.innerHTML = '<canvas id="member-performance-chart"></canvas>';
    performanceSection.appendChild(chartContainer);

    // Initialize performance chart
    initializePerformanceChart(completedTasks, inProgressTasks, pendingTasks);

    // Add performance trends (for demo purposes)
    const trendsContainer = document.createElement('div');
    trendsContainer.className = 'performance-trends';
    trendsContainer.innerHTML = `
        <h4>Performance Trends</h4>
        <div class="trend-item">
            <div class="trend-label">Task Completion Time</div>
            <div class="trend-value ${Math.random() > 0.5 ? 'positive' : 'negative'}">
                <i class="fas ${Math.random() > 0.5 ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                ${Math.floor(Math.random() * 20) + 5}% from last month
            </div>
        </div>
        <div class="trend-item">
            <div class="trend-label">On-time Delivery</div>
            <div class="trend-value ${Math.random() > 0.3 ? 'positive' : 'negative'}">
                <i class="fas ${Math.random() > 0.3 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                ${Math.floor(Math.random() * 15) + 2}% from last month
            </div>
        </div>
    `;
    performanceSection.appendChild(trendsContainer);
}

// Function to initialize performance chart
function initializePerformanceChart(completedTasks, inProgressTasks, pendingTasks) {
    const ctx = document.getElementById('member-performance-chart')?.getContext('2d');
    if (!ctx) return;

    // Check if there's an existing chart and destroy it
    if (window.memberPerformanceChart) {
        window.memberPerformanceChart.destroy();
    }

    // Create the chart
    window.memberPerformanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [completedTasks, inProgressTasks, pendingTasks],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',  // Completed - green
                    'rgba(54, 162, 235, 0.8)',  // In Progress - blue
                    'rgba(201, 203, 207, 0.8)'  // Pending - gray
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(201, 203, 207, 1)'
                ],
                borderWidth: 1,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: 12
                        },
                        color: '#666'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    cornerRadius: 6,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            }
        }
    });
}

// Function to show empty member details
function showEmptyMemberDetails() {
    // Clear member details section
    const memberDetails = document.getElementById('member-details');
    if (memberDetails) {
        memberDetails.innerHTML = `
            <div class="empty-section">
                <i class="fas fa-user"></i>
                <h4>Select a Team Member</h4>
                <p>Click on a team member to view their details, projects, and tasks.</p>
            </div>
        `;
    }

    // Clear projects section
    const memberProjects = document.getElementById('member-projects');
    if (memberProjects) {
        memberProjects.innerHTML = '';
    }

    // Clear tasks section
    const memberTasks = document.getElementById('member-tasks');
    if (memberTasks) {
        memberTasks.innerHTML = '';
    }

    // Clear performance chart if it exists
    if (window.memberPerformanceChart) {
        window.memberPerformanceChart.destroy();
    }
}

// Function to set up tabs event listeners
function setupTabsEventListeners() {
    console.log('Setting up tabs event listeners');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log('Found tab buttons:', tabButtons.length);
    console.log('Found tab contents:', tabContents.length);

    // Log all tab buttons and their data-tab attributes for debugging
    tabButtons.forEach((btn, index) => {
        console.log(`Tab button ${index}:`, btn.outerHTML, 'data-tab:', btn.getAttribute('data-tab'));
    });

    // Log all tab contents and their IDs for debugging
    tabContents.forEach((content, index) => {
        console.log(`Tab content ${index}:`, content.id);
    });

    // Remove any existing click event listeners first to prevent duplicates
    tabButtons.forEach(button => {
        button.removeEventListener('click', tabClickHandler);
        // Add a direct click handler for immediate testing
        button.onclick = function() {
            console.log('Direct onclick handler fired for tab:', this.getAttribute('data-tab'));
            switchTab(this.getAttribute('data-tab'));
        };
    });

    // Add new click event listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', tabClickHandler);
    });
}

// Separate function for tab click handling to make it easier to remove/add
function tabClickHandler(event) {
    console.log('Tab button clicked via event listener:', this.getAttribute('data-tab'));
    switchTab(this.getAttribute('data-tab'));
}

// Function to switch tabs
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active class from all buttons and contents
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        console.log('Removed active class from button:', btn.getAttribute('data-tab'));
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
        console.log('Removed active class from content:', content.id);
    });

    // Add active class to clicked button
    const activeButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        console.log('Added active class to button:', tabId);
    } else {
        console.error('Button not found for tab ID:', tabId);
    }

    // Add active class to corresponding content
    const tabContent = document.getElementById(`${tabId}-tab`);
    console.log('Looking for tab content with ID:', `${tabId}-tab`);

    if (tabContent) {
        tabContent.classList.add('active');
        console.log('Added active class to tab content:', tabContent.id);
    } else {
        console.error('Tab content not found for tab ID:', tabId);

        // Log all available tab contents for debugging
        console.log('Available tab contents:');
        document.querySelectorAll('.tab-content').forEach(content => {
            console.log('- Content ID:', content.id);
        });
    }
}

// Function to check for quick actions
function checkForQuickActions() {
    // Check if there's a hash in the URL
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);

        // Handle different quick actions
        if (hash === 'new-member') {
            // Switch to members tab if needed
            const membersTab = document.querySelector('.tab-btn[data-tab="members"]');
            if (membersTab && !membersTab.classList.contains('active')) {
                membersTab.click();
            }

            // Trigger new member button click
            const newMemberBtn = document.querySelector('.new-member-btn');
            if (newMemberBtn) {
                newMemberBtn.click();
            }
        } else if (hash === 'new-team') {
            // Switch to teams tab if needed
            const teamsTab = document.querySelector('.tab-btn[data-tab="teams"]');
            if (teamsTab && !teamsTab.classList.contains('active')) {
                teamsTab.click();
            }

            // Trigger new team button click
            const newTeamBtn = document.querySelector('.new-team-btn');
            if (newTeamBtn) {
                newTeamBtn.click();
            }
        }
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Using the global showNotification function from notification.js

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
                    <button type="button" class="team-action-btn view-team-btn" data-team-id="${team._id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button type="button" class="team-action-btn edit-team-btn" data-team-id="${team._id}">
                        <i class="fas fa-edit"></i> Edit
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
                        <button type="button" class="team-member-action" title="View Member">
                            <i class="fas fa-eye"></i>
                        </button>
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
                    <button type="button" class="edit-team-btn" data-team-id="${team._id}">
                        <i class="fas fa-edit"></i> Edit Team
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
                    <div class="team-members-list">
                        ${membersHTML}
                    </div>
                </div>

                <div class="team-detail-section">
                    <h3><i class="fas fa-project-diagram"></i> Projects</h3>
                    <div class="team-projects-list">
                        ${projectsHTML}
                    </div>
                </div>

                <div class="team-detail-section">
                    <h3><i class="fas fa-chart-pie"></i> Performance</h3>
                    <div class="team-performance-section">
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

    // Initialize performance chart
    setTimeout(() => {
        initializeTeamPerformanceChart(team);
    }, 100);
}

// Function to initialize team performance chart
function initializeTeamPerformanceChart(team) {
    const ctx = document.getElementById('team-performance-chart')?.getContext('2d');
    if (!ctx) return;

    // Check if there's an existing chart and destroy it
    if (window.teamPerformanceChart) {
        window.teamPerformanceChart.destroy();
    }

    // Generate random data for demo purposes
    const notStarted = Math.floor(Math.random() * 10);
    const inProgress = Math.floor(Math.random() * 15);
    const completed = Math.floor(Math.random() * 20);

    // Create the chart
    window.teamPerformanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [completed, inProgress, notStarted],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',  // Completed - green
                    'rgba(54, 162, 235, 0.8)',  // In Progress - blue
                    'rgba(201, 203, 207, 0.8)'  // Not Started - gray
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(201, 203, 207, 1)'
                ],
                borderWidth: 1,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                            size: 12
                        },
                        color: '#666'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    cornerRadius: 6,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
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

// Helper function to format status
function formatStatus(status) {
    switch(status) {
        case 'in-progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        case 'not-started':
            return 'Not Started';
        case 'planning':
            return 'Planning';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

// Set up event listeners for filters and search
document.addEventListener('DOMContentLoaded', function() {
    // Team search functionality
    const teamSearch = document.getElementById('team-search');
    if (teamSearch) {
        teamSearch.addEventListener('input', loadTeamMembers);

        // Add clear button to search
        const searchContainer = teamSearch.parentElement;
        const clearBtn = document.createElement('button');
        clearBtn.className = 'search-clear-btn';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.style.display = 'none';
        searchContainer.appendChild(clearBtn);

        // Show/hide clear button based on search input
        teamSearch.addEventListener('input', () => {
            clearBtn.style.display = teamSearch.value ? 'block' : 'none';
        });

        // Clear search when button is clicked
        clearBtn.addEventListener('click', () => {
            teamSearch.value = '';
            clearBtn.style.display = 'none';
            loadTeamMembers();
        });
    }

    // Teams search functionality
    const teamsSearch = document.getElementById('teams-search');
    if (teamsSearch) {
        teamsSearch.addEventListener('input', loadTeamsList);

        // Add clear button to search
        const searchContainer = teamsSearch.parentElement;
        const clearBtn = document.createElement('button');
        clearBtn.className = 'search-clear-btn';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.style.display = 'none';
        searchContainer.appendChild(clearBtn);

        // Show/hide clear button based on search input
        teamsSearch.addEventListener('input', () => {
            clearBtn.style.display = teamsSearch.value ? 'block' : 'none';
        });

        // Clear search when button is clicked
        clearBtn.addEventListener('click', () => {
            teamsSearch.value = '';
            clearBtn.style.display = 'none';
            loadTeamsList();
        });
    }

    // Department filter functionality
    const departmentFilter = document.getElementById('department-filter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', loadTeamMembers);
    }

    // Project filter functionality
    const projectFilter = document.getElementById('project-filter');
    if (projectFilter) {
        projectFilter.addEventListener('change', loadTeamsList);

        // Populate project filter options
        populateProjectFilter();
    }

    // Sort functionality
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', loadTeamMembers);
    }

    // New team and template buttons are now handled in setupTeamButtonsEventListeners()

    // Add theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeToggle.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        });
    }

    // Mobile menu toggle removed as requested

    // Initialize team modals
    if (typeof addTemplateModalStyles === 'function') {
        addTemplateModalStyles();
    }
}

// Function to populate project filter
async function populateProjectFilter() {
    const projectFilter = document.getElementById('project-filter');
    if (!projectFilter) return;

    try {
        // Fetch projects
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();

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
    } catch (error) {
        console.error('Error populating project filter:', error);
    }
}

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + / to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('team-search');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('team-search');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                const clearBtn = searchInput.parentElement.querySelector('.search-clear-btn');
                if (clearBtn) {
                    clearBtn.style.display = 'none';
                }
                loadTeamMembers();
            }
        }
    });

    // Add window resize handler for responsive layout
    window.addEventListener('resize', handleResponsiveLayout);
    handleResponsiveLayout();
});

// Function to handle responsive layout changes
function handleResponsiveLayout() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const isSmallScreen = window.innerWidth < 1024; // Both mobile and tablet

    // Adjust layout based on screen size
    const teamGrid = document.getElementById('team-grid');
    if (teamGrid) {
        if (isSmallScreen) {
            teamGrid.classList.add('mobile-grid');
        } else {
            teamGrid.classList.remove('mobile-grid');
        }
    }

    // Close mobile menu when resizing to desktop
    if (!isSmallScreen) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            // Mobile sidebar toggle removed
        }
    }
}
