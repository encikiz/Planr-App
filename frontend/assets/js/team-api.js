// Team API functions

// Function to fetch all team members
window.fetchTeamMembers = async function() {
    try {
        console.log('Fetching team members from API...');
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

// Function to fetch a team member by ID
window.fetchTeamMemberById = async function(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
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
window.fetchMemberProjects = async function(memberId) {
    try {
        const response = await fetch(`/api/users/${memberId}/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch member projects');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching member projects:', error);
        showNotification('Failed to load member projects', 'error');
        return [];
    }
}

// Function to fetch member tasks
window.fetchMemberTasks = async function(memberId) {
    try {
        const response = await fetch(`/api/users/${memberId}/tasks`);
        if (!response.ok) {
            throw new Error('Failed to fetch member tasks');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching member tasks:', error);
        showNotification('Failed to load member tasks', 'error');
        return [];
    }
}

// Function to fetch member performance data
window.fetchMemberPerformance = async function(memberId) {
    try {
        console.log('Fetching performance data for member:', memberId);
        const response = await fetch(`/api/users/${memberId}/performance`);
        if (!response.ok) {
            throw new Error('Failed to fetch member performance data');
        }
        const data = await response.json();
        console.log('Performance data fetched successfully:', data);
        return data;
    } catch (error) {
        console.error('Error fetching member performance data:', error);
        showNotification('Failed to load performance data', 'error');
        return null;
    }
}

// Function to fetch current user
async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/users/current');
        if (!response.ok) {
            throw new Error('Failed to fetch current user');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}

// Function to fetch all teams
async function fetchTeams() {
    try {
        console.log('Fetching teams from API...');
        const response = await fetch('/api/teams');
        if (!response.ok) {
            throw new Error('Failed to fetch teams');
        }
        const teams = await response.json();
        console.log('Teams fetched successfully:', teams);
        return teams;
    } catch (error) {
        console.error('Error fetching teams:', error);
        showNotification('Failed to load teams', 'error');
        return [];
    }
}

// Function to fetch a team by ID
async function fetchTeamById(teamId) {
    try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch team');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching team:', error);
        showNotification('Failed to load team details', 'error');
        return null;
    }
}

// Function to create a new team
async function createTeam(teamData) {
    try {
        const response = await fetch('/api/teams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teamData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create team');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating team:', error);
        showNotification(error.message || 'Failed to create team', 'error');
        return null;
    }
}

// Function to update a team
async function updateTeam(teamId, teamData) {
    try {
        const response = await fetch(`/api/teams/${teamId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teamData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update team');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating team:', error);
        showNotification(error.message || 'Failed to update team', 'error');
        return null;
    }
}

// Function to delete a team
async function deleteTeam(teamId) {
    try {
        const response = await fetch(`/api/teams/${teamId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete team');
        }

        return true;
    } catch (error) {
        console.error('Error deleting team:', error);
        showNotification(error.message || 'Failed to delete team', 'error');
        return false;
    }
}

// Function to add a member to a team
async function addTeamMember(teamId, userId, role) {
    try {
        const response = await fetch(`/api/teams/${teamId}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, role })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add team member');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding team member:', error);
        showNotification(error.message || 'Failed to add team member', 'error');
        return null;
    }
}

// Function to remove a member from a team
async function removeTeamMember(teamId, userId) {
    try {
        const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove team member');
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing team member:', error);
        showNotification(error.message || 'Failed to remove team member', 'error');
        return null;
    }
}

// Function to add a project to a team
async function addTeamProject(teamId, projectId) {
    try {
        const response = await fetch(`/api/teams/${teamId}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ projectId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add project to team');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding project to team:', error);
        showNotification(error.message || 'Failed to add project to team', 'error');
        return null;
    }
}

// Function to remove a project from a team
async function removeTeamProject(teamId, projectId) {
    try {
        const response = await fetch(`/api/teams/${teamId}/projects/${projectId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove project from team');
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing project from team:', error);
        showNotification(error.message || 'Failed to remove project from team', 'error');
        return null;
    }
}

// Function to render team member selection in forms
async function renderTeamMemberSelection(containerId, selectedMembers = []) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Create the structure for the enhanced selection UI
        container.innerHTML = `
            <div class="member-selection-controls">
                <div class="member-search-container">
                    <i class="fas fa-search member-search-icon"></i>
                    <input type="text" class="member-search-input" placeholder="Search members..." id="member-search">
                </div>
                <select class="member-filter-dropdown" id="member-filter" aria-label="Filter members">
                    <option value="all">All Members</option>
                    <option value="selected">Selected</option>
                    <option value="unselected">Unselected</option>
                </select>
            </div>
            <div class="team-members-grid">
                <div class="loading-members">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading team members...</p>
                </div>
            </div>
            <div class="selected-members-summary" style="display: none;">
                <div class="summary-header">
                    <span class="summary-title">Selected Members</span>
                    <span class="summary-count">0 selected</span>
                </div>
                <div class="selected-members-list"></div>
            </div>
        `;

        // Fetch team members
        const teamMembers = await fetchTeamMembers();

        if (!teamMembers || teamMembers.length === 0) {
            const membersGrid = container.querySelector('.team-members-grid');
            membersGrid.innerHTML = `
                <div class="empty-members">
                    <i class="fas fa-users"></i>
                    <p>No team members available</p>
                </div>
            `;
            return;
        }

        // Store the team members data for filtering
        container.teamMembersData = teamMembers;
        container.selectedMemberIds = selectedMembers.map(m => typeof m === 'string' ? m : m._id);

        // Render the team members grid
        renderMembersGrid(container);

        // Set up event listeners for search and filter
        setupMemberSelectionControls(container);
    } catch (error) {
        console.error('Error rendering team member selection:', error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="empty-members">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load team members</p>
                </div>
            `;
        }
    }
}

// Function to render the members grid based on current filters
function renderMembersGrid(container) {
    const teamMembers = container.teamMembersData || [];
    const selectedMemberIds = container.selectedMemberIds || [];
    const searchTerm = container.querySelector('#member-search')?.value.toLowerCase() || '';
    const filterValue = container.querySelector('#member-filter')?.value || 'all';

    // Filter members based on search and filter
    const filteredMembers = teamMembers.filter(member => {
        // Search filter
        const matchesSearch =
            member.name.toLowerCase().includes(searchTerm) ||
            (member.email && member.email.toLowerCase().includes(searchTerm)) ||
            (member.role && member.role.toLowerCase().includes(searchTerm));

        // Selection filter
        const isSelected = selectedMemberIds.includes(member._id);
        const matchesFilter =
            filterValue === 'all' ||
            (filterValue === 'selected' && isSelected) ||
            (filterValue === 'unselected' && !isSelected);

        return matchesSearch && matchesFilter;
    });

    // Get the grid element
    const membersGrid = container.querySelector('.team-members-grid');

    // Check if we have any members after filtering
    if (filteredMembers.length === 0) {
        membersGrid.innerHTML = `
            <div class="empty-members">
                <i class="fas fa-filter"></i>
                <p>No members match your filters</p>
            </div>
        `;
        return;
    }

    // Create HTML for team member selection
    let html = '';

    filteredMembers.forEach(member => {
        const isSelected = selectedMemberIds.includes(member._id);
        const avatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`;
        const department = member.department ? `<span class="member-department">${member.department}</span>` : '';

        html += `
            <div class="team-member-item ${isSelected ? 'selected' : ''}" data-id="${member._id}">
                <input type="checkbox" id="member-${member._id}" name="teamMembers" value="${member._id}" ${isSelected ? 'checked' : ''}>
                <div class="member-checkbox"></div>
                <div class="avatar">
                    <img src="${avatar}" alt="${member.name}">
                </div>
                <div class="member-info">
                    <span class="member-name">${member.name}</span>
                    <span class="member-role">${member.role || 'Team Member'}</span>
                    ${department}
                </div>
            </div>
        `;
    });

    membersGrid.innerHTML = html;

    // Add event listeners to the member items
    membersGrid.querySelectorAll('.team-member-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking directly on the checkbox
            if (e.target.type === 'checkbox') return;

            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);

            // Update the selected members array
            const memberId = this.dataset.id;
            if (checkbox.checked) {
                if (!container.selectedMemberIds.includes(memberId)) {
                    container.selectedMemberIds.push(memberId);
                }
            } else {
                container.selectedMemberIds = container.selectedMemberIds.filter(id => id !== memberId);
            }

            // Update the selected members summary
            updateSelectedMembersSummary(container);

            // Trigger change event
            const event = new Event('change', { bubbles: true });
            checkbox.dispatchEvent(event);
        });
    });

    // Update the selected members summary
    updateSelectedMembersSummary(container);
}

// Function to update the selected members summary
function updateSelectedMembersSummary(container) {
    const selectedMemberIds = container.selectedMemberIds || [];
    const teamMembers = container.teamMembersData || [];
    const summaryContainer = container.querySelector('.selected-members-summary');
    const summaryCount = summaryContainer.querySelector('.summary-count');
    const summaryList = summaryContainer.querySelector('.selected-members-list');

    // Update the count
    summaryCount.textContent = `${selectedMemberIds.length} selected`;

    // Show/hide the summary based on selection
    summaryContainer.style.display = selectedMemberIds.length > 0 ? 'block' : 'none';

    // If no members are selected, return
    if (selectedMemberIds.length === 0) {
        return;
    }

    // Create the selected members list
    let html = '';

    selectedMemberIds.forEach(memberId => {
        const member = teamMembers.find(m => m._id === memberId);
        if (!member) return;

        const avatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff`;

        html += `
            <div class="selected-member-chip" data-id="${member._id}">
                <img src="${avatar}" alt="${member.name}">
                <span>${member.name}</span>
                <button type="button" class="remove-member-btn" title="Remove ${member.name}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    summaryList.innerHTML = html;

    // Add event listeners to remove buttons
    summaryList.querySelectorAll('.remove-member-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const chip = this.closest('.selected-member-chip');
            const memberId = chip.dataset.id;

            // Update the checkbox in the grid
            const checkbox = container.querySelector(`input[value="${memberId}"]`);
            if (checkbox) {
                checkbox.checked = false;
                const item = checkbox.closest('.team-member-item');
                if (item) {
                    item.classList.remove('selected');
                }
            }

            // Update the selected members array
            container.selectedMemberIds = container.selectedMemberIds.filter(id => id !== memberId);

            // Update the summary
            updateSelectedMembersSummary(container);
        });
    });
}

// Function to set up event listeners for the member selection controls
function setupMemberSelectionControls(container) {
    const searchInput = container.querySelector('#member-search');
    const filterDropdown = container.querySelector('#member-filter');

    // Search input event
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderMembersGrid(container);
        });
    }

    // Filter dropdown event
    if (filterDropdown) {
        filterDropdown.addEventListener('change', () => {
            renderMembersGrid(container);
        });
    }
}

// Function to get selected team members from a form
function getSelectedTeamMembers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    // If we're using the enhanced selection UI, use the stored selectedMemberIds
    if (container.selectedMemberIds) {
        return container.selectedMemberIds;
    }

    // Fallback to the old method
    const checkboxes = container.querySelectorAll('input[name="teamMembers"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// Function to set a team leader
async function setTeamLeader(teamId, userId) {
    try {
        const response = await fetch(`/api/teams/${teamId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teamLeader: userId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to set team leader');
        }

        return await response.json();
    } catch (error) {
        console.error('Error setting team leader:', error);
        showNotification(error.message || 'Failed to set team leader', 'error');
        return null;
    }
}

// Function to delete a user
window.deleteUser = async function(userId) {
    try {
        console.log('Deleting user with ID:', userId);
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete user');
        }

        showNotification('User deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification(error.message || 'Failed to delete user', 'error');
        return false;
    }
}

// Function to get team performance metrics
async function getTeamPerformanceMetrics(teamId) {
    try {
        // In a real implementation, this would fetch from the backend
        // For now, we'll generate some sample metrics
        const team = await fetchTeamById(teamId);
        if (!team) return null;

        // Calculate metrics based on team data
        const memberCount = team.members ? team.members.length : 0;
        const projectCount = team.projects ? team.projects.length : 0;

        // Calculate average project progress
        let totalProgress = 0;
        if (team.projects && team.projects.length > 0) {
            team.projects.forEach(project => {
                totalProgress += project.progress || 0;
            });
        }
        const avgProgress = projectCount > 0 ? Math.round(totalProgress / projectCount) : 0;

        return {
            memberCount,
            projectCount,
            avgProgress,
            taskDistribution: {
                notStarted: Math.floor(Math.random() * 10),
                inProgress: Math.floor(Math.random() * 15),
                completed: Math.floor(Math.random() * 20)
            }
        };
    } catch (error) {
        console.error('Error getting team performance metrics:', error);
        return null;
    }
}
