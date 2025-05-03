// Milestones Consolidated JavaScript
// This file contains all milestone-related functionality in one place

// Global state flags
let isMilestoneModalInitializing = false;

// Define global closeMilestoneModal function first to ensure it's available
window.closeMilestoneModal = function() {
    console.log('Global closeMilestoneModal function called');
    const modalOverlay = document.getElementById('milestone-modal-overlay');
    console.log('Modal overlay element:', modalOverlay);

    if (modalOverlay) {
        console.log('Removing modal overlay');
        modalOverlay.remove();
        console.log('Modal overlay removed');
    } else {
        console.error('Modal overlay element not found');
    }

    // Reset the modal initialization flag
    isMilestoneModalInitializing = false;
    console.log('Modal initialization flag reset');

    document.body.style.overflow = '';
    console.log('Body overflow reset');
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the milestones page
    initializeMilestonesPage();

    // Set up event listeners
    setupMilestonesPageEventListeners();

    // Check for hash fragments for quick actions
    checkForQuickActions();
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Function to format date in a readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to format date for input fields
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Function to get status icon based on milestone status
function getStatusIcon(status) {
    switch(status) {
        case 'completed':
            return '<i class="fas fa-check-circle"></i>';
        case 'in-progress':
            return '<i class="fas fa-spinner"></i>';
        case 'not-started':
            return '<i class="fas fa-clock"></i>';
        default:
            return '<i class="fas fa-circle"></i>';
    }
}

// Function to get status label
function getStatusLabel(status) {
    switch(status) {
        case 'completed':
            return 'Completed';
        case 'in-progress':
            return 'In Progress';
        case 'not-started':
            return 'Not Started';
        default:
            return status;
    }
}

// Function to render milestone deliverables
function renderDeliverables(deliverables) {
    if (!deliverables || deliverables.length === 0) {
        return '';
    }

    const deliverablesList = deliverables.map(deliverable =>
        `<span class="deliverable-tag">${deliverable}</span>`
    ).join('');

    return `
        <div class="milestone-deliverables">
            <div class="milestone-deliverables-title">Deliverables:</div>
            <div class="deliverables-list">
                ${deliverablesList}
            </div>
        </div>
    `;
}

// Function to show loading overlay
function showLoadingOverlay(message = 'Loading...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        loadingOverlay.style.display = 'flex';
    }
}

// Function to hide loading overlay
function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Function to check if a date is in a specific range
function isInDateRange(dateString, range) {
    if (!dateString) return false;

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch(range) {
        case 'today':
            return date >= today && date < tomorrow;
        case 'this-week':
            return date >= weekStart && date < weekEnd;
        case 'this-month':
            return date >= monthStart && date <= monthEnd;
        case 'overdue':
            return date < today;
        default:
            return true;
    }
}

// ==========================================
// API FUNCTIONS
// ==========================================

// Function to fetch all milestones
async function fetchMilestones() {
    console.log('Fetching all milestones from API');
    try {
        // Check if user is authenticated
        const userResponse = await fetch('/api/auth/user');
        if (!userResponse.ok) {
            console.error('User not authenticated, redirecting to login');
            window.location.href = '/login';
            return [];
        }

        const userData = await userResponse.json();
        console.log('User authenticated:', userData);

        // Add cache-busting query parameter to prevent caching
        const timestamp = new Date().getTime();
        console.log(`Making API request to /api/milestones?_=${timestamp}`);

        // Set up a timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.error('Request timeout triggered');
            controller.abort();
        }, 10000); // 10 second timeout

        console.log('Making API request with authenticated user');

        // Direct API call to debug endpoint to check if milestones exist
        console.log('Checking debug endpoint first');
        const debugResponse = await fetch('/api/milestones/debug');
        const debugData = await debugResponse.json();
        console.log('Debug data:', debugData);
        console.log('Milestone count from debug endpoint:', debugData.count);

        if (debugData.count > 0) {
            console.log('Milestones exist in the database according to debug endpoint');
            console.log('Sample milestone:', debugData.sample[0]);
        } else {
            console.log('No milestones found in the database according to debug endpoint');

            // Create a test milestone using the test endpoint
            console.log('Creating a test milestone using the test endpoint');
            const testResponse = await fetch('/api/milestones/test');
            const testData = await testResponse.json();
            console.log('Test milestone created:', testData);
        }

        // Make the API call to get milestones
        console.log('Making API call to /api/milestones with user ID:', userData._id);

        // Make a direct API call to the milestones endpoint
        try {
            console.log('Making direct API call to /api/milestones');
            const directResponse = await fetch('/api/milestones', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log('Direct API call response:', directResponse.status, directResponse.statusText);

            if (directResponse.ok) {
                const directData = await directResponse.json();
                console.log('Direct API call data:', directData);
                console.log('Number of milestones returned:', directData.length);

                if (directData.length === 0) {
                    console.log('No milestones returned from API, but they exist in the database. This might be an issue with the API endpoint.');
                } else {
                    console.log('First milestone from API:', directData[0]);

                    // Log all milestone IDs for debugging
                    console.log('All milestone IDs:');
                    directData.forEach((milestone, index) => {
                        console.log(`Milestone ${index + 1} ID: ${milestone._id}`);
                    });
                }

                // Return the data directly from this call
                clearTimeout(timeoutId);
                return directData;
            } else {
                console.error('Direct API call failed with status:', directResponse.status);
                const errorText = await directResponse.text();
                console.error('Error response:', errorText);
            }
        } catch (directError) {
            console.error('Error with direct API call:', directError);
        }

        // Fallback to the original approach if the direct call fails
        console.log('Falling back to original approach');
        const response = await fetch(`/api/milestones`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            signal: controller.signal,
            credentials: 'include' // Use 'include' instead of 'same-origin'
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        console.log('API response received:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response not OK:', response.status, errorText);
            throw new Error(`Failed to fetch milestones: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Milestones data:', data);
        console.log('Milestones fetched successfully:', data.length);
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timed out after 10 seconds');
            showNotification('Request timed out. Please try again.', 'error');
        } else {
            console.error('Error fetching milestones:', error);
            console.error('Error details:', error.message, error.stack);
            showNotification('Failed to load milestones: ' + error.message, 'error');
        }

        // Return empty array but also show empty state
        const milestonesList = document.getElementById('milestones-container') || document.getElementById('milestones-list');
        const noMilestonesMessage = document.getElementById('no-milestones-message');

        if (milestonesList && noMilestonesMessage) {
            milestonesList.innerHTML = '';
            noMilestonesMessage.classList.remove('hidden');
        }

        return [];
    }
}

// Function to fetch milestones for a specific project
async function fetchProjectMilestones(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}/milestones`);
        if (!response.ok) {
            throw new Error('Failed to fetch project milestones');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching project milestones:', error);
        showNotification('Failed to load project milestones', 'error');
        return [];
    }
}

// Function to fetch a milestone by ID
async function fetchMilestoneById(milestoneId) {
    try {
        const response = await fetch(`/api/milestones/${milestoneId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch milestone');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching milestone:', error);
        showNotification('Failed to load milestone details', 'error');
        return null;
    }
}

// Function to create a new milestone
async function createMilestone(milestoneData) {
    try {
        const response = await fetch('/api/milestones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(milestoneData)
        });

        if (!response.ok) {
            throw new Error('Failed to create milestone');
        }

        const newMilestone = await response.json();
        return newMilestone;
    } catch (error) {
        console.error('Error creating milestone:', error);
        showNotification('Failed to create milestone', 'error');
        return null;
    }
}

// Function to update a milestone
async function updateMilestone(milestoneId, milestoneData) {
    try {
        const response = await fetch(`/api/milestones/${milestoneId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(milestoneData)
        });

        if (!response.ok) {
            throw new Error('Failed to update milestone');
        }

        const updatedMilestone = await response.json();
        return updatedMilestone;
    } catch (error) {
        console.error('Error updating milestone:', error);
        showNotification('Failed to update milestone', 'error');
        return null;
    }
}

// Function to delete a milestone
async function deleteMilestone(milestoneId) {
    try {
        const response = await fetch(`/api/milestones/${milestoneId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete milestone');
        }

        return true;
    } catch (error) {
        console.error('Error deleting milestone:', error);
        showNotification('Failed to delete milestone', 'error');
        return false;
    }
}

// Function to fetch all projects
async function fetchProjects() {
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

// ==========================================
// PAGE INITIALIZATION & EVENT HANDLING
// ==========================================

// Function to check for quick actions in URL
function checkForQuickActions() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Check for edit parameter
    const editMilestoneId = urlParams.get('edit');
    if (editMilestoneId) {
        // Open edit modal for the specified milestone
        setTimeout(() => {
            openEditMilestoneModal(editMilestoneId);
        }, 500); // Small delay to ensure page is loaded
        return;
    }

    // Check for new parameter
    const newMilestone = urlParams.get('new');
    if (newMilestone === 'true') {
        // Open new milestone modal
        setTimeout(() => {
            openNewMilestoneModal();
        }, 500); // Small delay to ensure page is loaded
        return;
    }

    // Check if there's a hash in the URL
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);

        // Handle different quick actions
        if (hash === 'new-milestone') {
            // Trigger new milestone button click
            const newMilestoneBtn = document.getElementById('new-milestone-btn');
            if (newMilestoneBtn) {
                newMilestoneBtn.click();
            }
        }
    }
}

// Initialize the milestones page
async function initializeMilestonesPage() {
    try {
        // Show loading overlay
        showLoadingOverlay('Loading milestones...');

        // Update user information in the header
        await updateUserInfo();

        // Load projects for the filter dropdown
        await loadProjectsForFilter();

        // Load all milestones
        await loadAllMilestones();

        // Hide loading overlay
        hideLoadingOverlay();
    } catch (error) {
        console.error('Error initializing milestones page:', error);
        showNotification('Failed to load milestones', 'error');
        hideLoadingOverlay();
    }
}

// Update user information in the header
async function updateUserInfo() {
    try {
        // Fetch current user
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Update welcome message
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage && userData) {
            welcomeMessage.textContent = `Welcome, ${userData.name}`;
        }

        // Update avatar
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar && userData && userData.avatar) {
            const avatarImg = userAvatar.querySelector('img');
            if (avatarImg) {
                avatarImg.src = userData.avatar;
                avatarImg.alt = userData.name;
            }
        }
    } catch (error) {
        console.error('Error updating user info:', error);
        // Don't show notification for this error as it's not critical
    }
}

// Set up event listeners for the milestones page
function setupMilestonesPageEventListeners() {
    console.log('Setting up milestones page event listeners');

    // New milestone button
    const newMilestoneBtn = document.getElementById('new-milestone-btn');
    console.log('New milestone button:', newMilestoneBtn);

    if (newMilestoneBtn) {
        console.log('Adding click event listener to new milestone button');
        newMilestoneBtn.addEventListener('click', async function() {
            console.log('New milestone button clicked from event listener');
            try {
                await openNewMilestoneModal();
            } catch (error) {
                console.error('Error calling openNewMilestoneModal:', error);
                showNotification('Error opening new milestone modal: ' + error.message, 'error');
            }
        });
    } else {
        console.error('New milestone button not found in setupMilestonesPageEventListeners');
    }

    // Empty state new milestone button
    const emptyStateNewMilestoneBtn = document.getElementById('empty-state-new-milestone-btn');
    if (emptyStateNewMilestoneBtn) {
        emptyStateNewMilestoneBtn.addEventListener('click', async function() {
            try {
                await openNewMilestoneModal();
            } catch (error) {
                console.error('Error calling openNewMilestoneModal:', error);
                showNotification('Error opening new milestone modal: ' + error.message, 'error');
            }
        });
    }

    // Search input
    const searchInput = document.getElementById('milestone-search');
    if (searchInput) {
        console.log('Adding input event listener to search input');
        searchInput.addEventListener('input', filterMilestones);
    } else {
        console.error('Search input not found');
    }

    // Filter dropdowns
    const projectFilter = document.getElementById('project-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');

    if (projectFilter) projectFilter.addEventListener('change', filterMilestones);
    if (statusFilter) statusFilter.addEventListener('change', filterMilestones);
    if (dateFilter) dateFilter.addEventListener('change', filterMilestones);
}

// Load projects for the filter dropdown
async function loadProjectsForFilter() {
    try {
        const projectFilter = document.getElementById('project-filter');
        if (!projectFilter) return;

        // Fetch projects from API
        const projects = await fetchProjects();

        // Clear existing options except the first one
        while (projectFilter.options.length > 1) {
            projectFilter.remove(1);
        }

        // Add projects to the dropdown
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project._id;
            option.textContent = project.name;
            projectFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading projects for filter:', error);
        showNotification('Failed to load projects', 'error');
    }
}

// ==========================================
// MILESTONE LISTING & FILTERING
// ==========================================

// Load all milestones
async function loadAllMilestones() {
    console.log('Loading all milestones...');
    try {
        // Try to get the new container first, then fall back to the old one if needed
        const milestonesList = document.getElementById('milestones-container') || document.getElementById('milestones-list');
        const noMilestonesMessage = document.getElementById('no-milestones-message');

        console.log('Milestones container element:', milestonesList);
        console.log('No milestones message element:', noMilestonesMessage);

        if (!milestonesList) {
            console.error('Milestones container element not found');
            console.error('Available elements with IDs:');
            document.querySelectorAll('[id]').forEach(el => {
                console.log(`- ${el.id}`);
            });
            showNotification('Error: Milestones container not found', 'error');
            return;
        }

        if (!noMilestonesMessage) {
            console.error('No milestones message element not found');
            showNotification('Error: Empty state message not found', 'error');
            return;
        }

        // Hide the no milestones message while loading
        noMilestonesMessage.classList.add('hidden');

        // Clear existing content and add the loading indicator
        console.log('Clearing existing milestones container');
        milestonesList.innerHTML = '';

        // Create a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.id = 'milestones-loading-indicator';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading milestones...';
        milestonesList.appendChild(loadingIndicator);

        console.log('Loading indicator added to DOM');

        // Fetch all milestones
        console.log('Fetching milestones from API');
        const milestones = await fetchMilestones();
        console.log('Milestones fetched:', milestones ? milestones.length : 0);

        if (milestones && milestones.length > 0) {
            console.log('First milestone:', milestones[0]);
        }

        // Remove the loading indicator
        const loadingIndicatorElement = document.getElementById('milestones-loading-indicator');
        if (loadingIndicatorElement) {
            console.log('Removing loading indicator');
            loadingIndicatorElement.remove();
        } else {
            console.warn('Loading indicator not found for removal');
        }

        // If no milestones, show empty state
        if (!milestones || milestones.length === 0) {
            console.log('No milestones found, showing empty state');
            milestonesList.innerHTML = '';
            noMilestonesMessage.classList.remove('hidden');

            // Try to create a test milestone
            try {
                console.log('Creating a test milestone using the test endpoint');
                const testResponse = await fetch('/api/milestones/test');
                const testData = await testResponse.json();
                console.log('Test milestone created:', testData);

                // Reload the page to show the new milestone
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (testError) {
                console.error('Error creating test milestone:', testError);
            }

            return;
        }

        // Hide no milestones message
        console.log('Hiding no milestones message');
        noMilestonesMessage.classList.add('hidden');

        // Sort milestones by due date (closest first)
        console.log('Sorting milestones by due date');
        milestones.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // Render each milestone
        console.log('Rendering milestone cards');
        milestones.forEach((milestone, index) => {
            try {
                console.log(`Creating card for milestone ${index + 1}:`, milestone.name);
                const milestoneCard = createMilestoneCard(milestone);
                console.log(`Card created for milestone ${index + 1}`);

                // Add a staggered entrance animation
                milestoneCard.style.opacity = '0';
                milestoneCard.style.transform = 'translateY(10px)';

                milestonesList.appendChild(milestoneCard);
                console.log(`Card appended to container for milestone ${index + 1}`);

                // Trigger the animation with a staggered delay
                setTimeout(() => {
                    milestoneCard.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    milestoneCard.style.opacity = '1';
                    milestoneCard.style.transform = 'translateY(0)';
                }, 50 * index);
            } catch (cardError) {
                console.error('Error creating milestone card:', cardError, 'Milestone data:', milestone);
            }
        });

        console.log('All milestones loaded successfully');
        console.log('Milestones container HTML:', milestonesList.innerHTML);
    } catch (error) {
        console.error('Error loading milestones:', error);
        console.error('Error stack:', error.stack);
        showNotification('Failed to load milestones', 'error');
    }
}

// Create a milestone card element
function createMilestoneCard(milestone) {
    console.log('Creating milestone card for:', milestone);

    try {
        // Create milestone card element
        const milestoneCard = document.createElement('div');
        milestoneCard.className = `milestone-card ${milestone.status || 'not-started'}`;
        milestoneCard.dataset.id = milestone._id;

        console.log('Milestone card element created with ID:', milestone._id);

        // Store project ID for filtering
        if (milestone.projectId) {
            const projectId = typeof milestone.projectId === 'object' ? milestone.projectId._id : milestone.projectId;
            milestoneCard.dataset.projectId = projectId;
            console.log('Project ID stored for filtering:', projectId);
        }

        // Format dates
        const dueDate = formatDate(milestone.dueDate);
        console.log('Formatted due date:', dueDate);

        // Get status icon
        const statusIcon = getStatusIcon(milestone.status || 'not-started');
        console.log('Status icon:', statusIcon);

        // Get project name
        let projectName = 'Unknown Project';
        if (milestone.projectId) {
            if (typeof milestone.projectId === 'object' && milestone.projectId.name) {
                projectName = milestone.projectId.name;
            } else if (typeof milestone.projectId === 'string') {
                // Try to get project name from the projects list
                projectName = 'Project ID: ' + milestone.projectId;
            }
        }
        console.log('Project name:', projectName);

        // Create milestone card HTML
        const cardHTML = `
            <div class="milestone-header">
                <div>
                    <h3 class="milestone-title">
                        ${statusIcon}
                        ${milestone.name}
                    </h3>
                    <div class="milestone-project">
                        <i class="fas fa-project-diagram"></i> ${projectName}
                    </div>
                </div>
                <div class="milestone-actions">
                    <button type="button" class="milestone-edit-btn" title="Edit milestone">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="milestone-delete-btn" title="Delete milestone">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="milestone-meta">
                <span class="milestone-status ${milestone.status || 'not-started'}">${getStatusLabel(milestone.status || 'not-started')}</span>
                <span class="milestone-due"><i class="far fa-calendar-alt"></i> Due: ${dueDate}</span>
            </div>
            <div class="milestone-description">
                <p>${milestone.description || 'No description provided'}</p>
            </div>
            <div class="milestone-progress">
                <div class="progress-label">
                    <span>Progress</span>
                    <span class="progress-percentage">${milestone.progress || 0}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${milestone.progress || 0}%"></div>
                </div>
            </div>
            ${milestone.deliverables && milestone.deliverables.length > 0 ? `
                <div class="milestone-deliverables">
                    <h5>Deliverables:</h5>
                    <ul class="deliverables-list">
                        ${milestone.deliverables.map(deliverable => `<li><i class="fas fa-check-circle"></i> ${deliverable}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        console.log('Card HTML created');
        milestoneCard.innerHTML = cardHTML;
        console.log('Card HTML set');

        // Add event listeners
        const editBtn = milestoneCard.querySelector('.milestone-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event
                openEditMilestoneModal(milestone._id);
            });
            console.log('Edit button event listener added');
        } else {
            console.error('Edit button not found in milestone card');
        }

        const deleteBtn = milestoneCard.querySelector('.milestone-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event
                confirmDeleteMilestone(milestone._id);
            });
            console.log('Delete button event listener added');
        } else {
            console.error('Delete button not found in milestone card');
        }

        // Add click event to view milestone details
        milestoneCard.addEventListener('click', () => {
            window.location.href = `milestone-details.html?id=${milestone._id}`;
        });
        console.log('Card click event listener added');

        console.log('Milestone card created successfully');
        return milestoneCard;
    } catch (error) {
        console.error('Error creating milestone card:', error);
        console.error('Error stack:', error.stack);
        console.error('Milestone data:', milestone);

        // Create a simple fallback card
        const fallbackCard = document.createElement('div');
        fallbackCard.className = 'milestone-card error';
        fallbackCard.innerHTML = `
            <div class="milestone-header">
                <h3 class="milestone-title">Error: Could not render milestone</h3>
            </div>
            <div class="milestone-description">
                <p>There was an error rendering this milestone. Please try refreshing the page.</p>
            </div>
        `;
        return fallbackCard;
    }
}

// Filter milestones based on search and filter criteria
function filterMilestones() {
    const searchInput = document.getElementById('milestone-search');
    const projectFilter = document.getElementById('project-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    // Get milestone cards from the new container
    const container = document.getElementById('milestones-container') || document.getElementById('milestones-list');
    const milestoneCards = container ? container.querySelectorAll('.milestone-card') : document.querySelectorAll('.milestone-card');
    const noMilestonesMessage = document.getElementById('no-milestones-message');

    if (!milestoneCards.length) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const projectId = projectFilter ? projectFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';
    const dateRange = dateFilter ? dateFilter.value : '';

    let visibleCount = 0;

    milestoneCards.forEach(card => {
        // Get milestone data from the card
        const name = card.querySelector('.milestone-title').textContent.trim();
        const description = card.querySelector('.milestone-description').textContent.trim();
        const cardStatus = card.classList.contains('completed') ? 'completed' :
                       card.classList.contains('in-progress') ? 'in-progress' : 'not-started';
        const cardProjectId = card.dataset.projectId;
        const dueDate = card.querySelector('.milestone-due').textContent.trim().split('Due:')[1]?.trim();

        // Check if milestone matches all filters
        const matchesSearch = searchTerm === '' ||
                             name.toLowerCase().includes(searchTerm) ||
                             description.toLowerCase().includes(searchTerm);

        const matchesProject = projectId === '' || projectId === 'all' || cardProjectId === projectId;

        const matchesStatus = status === '' || status === 'all' || cardStatus === status;

        const matchesDate = dateRange === '' || dateRange === 'all' || isInDateRange(dueDate, dateRange);

        // Show or hide the milestone card
        if (matchesSearch && matchesProject && matchesStatus && matchesDate) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show or hide the no milestones message
    if (noMilestonesMessage) {
        if (visibleCount === 0) {
            noMilestonesMessage.classList.remove('hidden');
        } else {
            noMilestonesMessage.classList.add('hidden');
        }
    }
}

// ==========================================
// MILESTONE MODAL FUNCTIONALITY
// ==========================================

// Function to open new milestone modal
async function openNewMilestoneModal() {
    console.log('openNewMilestoneModal function called');

    try {
        // Create modal HTML
        console.log('Creating milestone modal HTML');
        const modalHTML = await createMilestoneModalHTML('add');

        console.log('Modal HTML created, adding to DOM');
        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        console.log('Initializing modal');
        // Initialize the modal
        initializeMilestoneModal();

        console.log('Modal initialized successfully');
    } catch (error) {
        console.error('Error in openNewMilestoneModal:', error);
        showNotification('Error opening new milestone modal: ' + error.message, 'error');
    }
}

// Function to open edit milestone modal
async function openEditMilestoneModal(milestoneId) {
    try {
        // Create modal HTML
        const modalHTML = await createMilestoneModalHTML('edit', milestoneId);

        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialize the modal
        initializeMilestoneModal(milestoneId);
    } catch (error) {
        console.error('Error in openEditMilestoneModal:', error);
        showNotification('Error opening edit milestone modal: ' + error.message, 'error');
    }
}

// Function to create milestone modal HTML
async function createMilestoneModalHTML(mode, milestoneId = null) {
    console.log('createMilestoneModalHTML called with mode:', mode, 'milestoneId:', milestoneId);

    let milestone = null;
    let modalTitle = 'Add New Milestone';
    let submitButtonText = 'Create Milestone';

    if (mode === 'edit' && milestoneId) {
        try {
            console.log('Fetching milestone by ID:', milestoneId);
            milestone = await fetchMilestoneById(milestoneId);
            if (!milestone) throw new Error('Milestone not found');

            modalTitle = 'Edit Milestone';
            submitButtonText = 'Update Milestone';
        } catch (error) {
            console.error('Error fetching milestone:', error);
            showNotification('Failed to load milestone details', 'error');
            return '';
        }
    }

    // Fetch projects for dropdown
    console.log('Fetching projects for dropdown');
    try {
        const projects = await fetchProjects();
        console.log('Projects fetched:', projects);

        return `
        <div class="modal-overlay" id="milestone-modal-overlay">
            <div class="modal milestone-modal">
                <div class="modal-header">
                    <h3>${modalTitle}</h3>
                    <button type="button" class="close-modal" id="milestone-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="milestone-form">
                        <div class="form-group">
                            <label for="milestone-project">Project <span class="required">*</span></label>
                            <select id="milestone-project" required>
                                <option value="">Select Project</option>
                                ${projects.map(project => `
                                    <option value="${project._id}" ${milestone && milestone.projectId && milestone.projectId._id === project._id ? 'selected' : ''}>
                                        ${project.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="milestone-name">Milestone Name <span class="required">*</span></label>
                            <input type="text" id="milestone-name" placeholder="Enter milestone name" required value="${milestone ? milestone.name : ''}">
                        </div>
                        <div class="form-group">
                            <label for="milestone-description">Description <span class="required">*</span></label>
                            <textarea id="milestone-description" placeholder="Enter milestone description" required>${milestone ? milestone.description : ''}</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="milestone-due-date">Due Date <span class="required">*</span></label>
                                <input type="date" id="milestone-due-date" required value="${milestone ? formatDateForInput(milestone.dueDate) : ''}">
                            </div>
                            <div class="form-group">
                                <label for="milestone-status">Status</label>
                                <select id="milestone-status">
                                    <option value="not-started" ${milestone && milestone.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                                    <option value="in-progress" ${milestone && milestone.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="completed" ${milestone && milestone.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="milestone-progress">Progress: <span id="progress-value">${milestone ? milestone.progress : '0'}%</span></label>
                            <input type="range" id="milestone-progress" min="0" max="100" step="5" value="${milestone ? milestone.progress : '0'}">
                        </div>
                        <div class="form-group">
                            <label for="milestone-deliverables">Deliverables (one per line)</label>
                            <textarea id="milestone-deliverables" placeholder="Enter deliverables, one per line">${milestone && milestone.deliverables ? milestone.deliverables.join('\n') : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="cancel-btn" id="milestone-cancel-btn">Cancel</button>
                    <button type="button" class="submit-btn" id="milestone-submit-btn">${submitButtonText}</button>
                </div>
            </div>
        </div>
    `;
    } catch (error) {
        console.error('Error in createMilestoneModalHTML:', error);
        showNotification('Failed to create milestone modal', 'error');
        return '';
    }
}

// Function to initialize milestone modal
function initializeMilestoneModal(milestoneId = null) {
    console.log('initializeMilestoneModal function called');

    // Add event listeners
    const closeButton = document.getElementById('milestone-modal-close');
    console.log('Close button element:', closeButton);

    if (closeButton) {
        console.log('Adding click event listener to close button');
        closeButton.addEventListener('click', function(e) {
            console.log('Close button clicked');
            e.preventDefault();
            e.stopPropagation();
            closeMilestoneModal();
        });
    } else {
        console.error('Close button element not found');
    }

    const cancelButton = document.getElementById('milestone-cancel-btn');
    console.log('Cancel button element:', cancelButton);

    if (cancelButton) {
        console.log('Adding click event listener to cancel button');
        cancelButton.addEventListener('click', function(e) {
            console.log('Cancel button clicked');
            e.preventDefault();
            e.stopPropagation();
            closeMilestoneModal();
        });
    } else {
        console.error('Cancel button element not found');
    }

    const submitButton = document.getElementById('milestone-submit-btn');
    console.log('Submit button element:', submitButton);

    if (submitButton) {
        console.log('Adding click event listener to submit button');
        submitButton.addEventListener('click', function(e) {
            console.log('Submit button clicked');
            e.preventDefault();
            e.stopPropagation();
            submitMilestoneForm(milestoneId);
        });
    } else {
        console.error('Submit button element not found');
    }

    // Add progress range input listener
    const progressInput = document.getElementById('milestone-progress');
    const progressValue = document.getElementById('progress-value');

    if (progressInput && progressValue) {
        console.log('Adding input event listener to progress input');
        progressInput.addEventListener('input', function() {
            progressValue.textContent = this.value + '%';
        });
    } else {
        console.error('Progress input or value element not found');
    }

    // Add status change listener to update progress automatically
    const statusSelect = document.getElementById('milestone-status');

    if (statusSelect && progressInput && progressValue) {
        console.log('Adding change event listener to status select');
        statusSelect.addEventListener('change', function() {
            if (this.value === 'completed') {
                progressInput.value = 100;
                progressValue.textContent = '100%';
            } else if (this.value === 'not-started' && progressInput.value === '0') {
                progressInput.value = 0;
                progressValue.textContent = '0%';
            }
        });
    } else {
        console.error('Status select, progress input, or progress value element not found');
    }

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    console.log('Body overflow set to hidden');
}



// Function to submit milestone form
async function submitMilestoneForm(milestoneId = null) {
    try {
        // Get form values
        const projectId = document.getElementById('milestone-project').value;
        const name = document.getElementById('milestone-name').value;
        const description = document.getElementById('milestone-description').value;
        const dueDate = document.getElementById('milestone-due-date').value;
        const status = document.getElementById('milestone-status').value;
        const progress = document.getElementById('milestone-progress').value;
        const deliverablesText = document.getElementById('milestone-deliverables').value;

        // Validate required fields
        if (!projectId || !name || !description || !dueDate) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Parse deliverables
        const deliverables = deliverablesText
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');

        // Create milestone object
        const milestoneData = {
            projectId,
            name,
            description,
            dueDate,
            status,
            progress: parseInt(progress),
            deliverables
        };

        let result;

        if (milestoneId) {
            // Update existing milestone
            result = await updateMilestone(milestoneId, milestoneData);
        } else {
            // Create new milestone
            result = await createMilestone(milestoneData);
        }

        if (result) {
            // Close modal
            closeMilestoneModal();

            // Reload milestones
            await loadAllMilestones();

            // Show success message
            showNotification(
                milestoneId ? 'Milestone updated successfully' : 'Milestone created successfully',
                'success'
            );
        }
    } catch (error) {
        console.error('Error submitting milestone form:', error);
        showNotification('Failed to save milestone', 'error');
    }
}

// Function to confirm delete milestone
async function confirmDeleteMilestone(milestoneId) {
    // Create confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirmation-dialog';
    confirmDialog.innerHTML = `
        <div class="confirmation-content">
            <h3>Delete Milestone</h3>
            <p>Are you sure you want to delete this milestone? This action cannot be undone.</p>
            <div class="confirmation-actions">
                <button type="button" class="cancel-btn" id="cancel-delete">Cancel</button>
                <button type="button" class="delete-btn" id="confirm-delete">Delete</button>
            </div>
        </div>
    `;

    // Add dialog to the DOM
    document.body.appendChild(confirmDialog);

    // Add event listeners
    document.getElementById('cancel-delete').addEventListener('click', () => {
        confirmDialog.remove();
    });

    document.getElementById('confirm-delete').addEventListener('click', async () => {
        try {
            // Delete milestone
            const result = await deleteMilestone(milestoneId);

            if (result) {
                // Remove dialog
                confirmDialog.remove();

                // Reload milestones
                await loadAllMilestones();

                // Show success message
                showNotification('Milestone deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting milestone:', error);
            showNotification('Failed to delete milestone', 'error');
        }
    });
}

// Function to get current project ID from URL or active project
function getCurrentProjectId() {
    // First try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    if (projectId) {
        return projectId; // Return as string to preserve MongoDB ObjectId
    }

    // If not in URL, try to get from active project in the list
    const activeProject = document.querySelector('.project-item.active');
    if (activeProject && activeProject.dataset.id) {
        return activeProject.dataset.id; // Return as string to preserve MongoDB ObjectId
    }

    // If no active project, return the first project's ID
    const firstProject = document.querySelector('.project-item');
    if (firstProject && firstProject.dataset.id) {
        return firstProject.dataset.id; // Return as string to preserve MongoDB ObjectId
    }

    return null; // Return null instead of a default ID
}

// Function to initialize project-specific milestones
function initializeProjectMilestones() {
    // Check if we're on the project details page
    const milestonesContainer = document.getElementById('milestones-list');
    if (milestonesContainer) {
        const projectId = getCurrentProjectId();
        if (projectId) {
            loadProjectMilestones(projectId);
        }
    }
}

// Function to load project milestones
async function loadProjectMilestones(projectId) {
    try {
        const milestonesList = document.getElementById('milestones-list');
        if (!milestonesList) return;

        // Clear existing content
        milestonesList.innerHTML = '';

        // Show loading state
        milestonesList.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading milestones...</div>';

        // Fetch milestones for the project
        const milestones = await fetchProjectMilestones(projectId);

        // Clear loading state
        milestonesList.innerHTML = '';

        // If no milestones, show empty state
        if (!milestones || milestones.length === 0) {
            milestonesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-flag"></i>
                    <p>No milestones yet</p>
                    <p class="empty-state-subtext">Add your first milestone to track project progress</p>
                </div>
            `;
            return;
        }

        // Sort milestones by due date
        milestones.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // Render each milestone
        milestones.forEach((milestone, index) => {
            const milestoneCard = createMilestoneCard(milestone);

            // Add a staggered entrance animation
            milestoneCard.style.opacity = '0';
            milestoneCard.style.transform = 'translateY(10px)';

            milestonesList.appendChild(milestoneCard);

            // Trigger the animation with a staggered delay
            setTimeout(() => {
                milestoneCard.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                milestoneCard.style.opacity = '1';
                milestoneCard.style.transform = 'translateY(0)';
            }, 50 * index);
        });
    } catch (error) {
        console.error('Error loading project milestones:', error);
        showNotification('Failed to load project milestones', 'error');
    }
}

// Function to show notification
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.getElementById('notification-container');

    // Create container if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;

    // Add to container
    notificationContainer.appendChild(notification);

    // Add close button event
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}



function createMilestoneCard(milestone) {
    // Create milestone card element
    const milestoneCard = document.createElement('div');
    milestoneCard.className = `milestone-card ${milestone.status}`;
    milestoneCard.dataset.id = milestone._id;

    // Store project ID for filtering
    if (milestone.projectId && milestone.projectId._id) {
        milestoneCard.dataset.projectId = milestone.projectId._id;
    }

    // Format dates
    const dueDate = formatDate(milestone.dueDate);

    // Get status icon
    const statusIcon = getStatusIcon(milestone.status);

    // Get project name
    const projectName = milestone.projectId ? milestone.projectId.name : 'Unknown Project';

    // Create milestone card HTML
    milestoneCard.innerHTML = `
        <div class="milestone-header">
            <div>
                <h3 class="milestone-title">
                    ${statusIcon}
                    ${milestone.name}
                </h3>
                <div class="milestone-project">
                    <i class="fas fa-project-diagram"></i> ${projectName}
                </div>
            </div>
            <div class="milestone-actions">
                <button type="button" class="milestone-edit-btn" title="Edit milestone">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="milestone-delete-btn" title="Delete milestone">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="milestone-meta">
            <span class="milestone-status ${milestone.status}">${getStatusLabel(milestone.status)}</span>
            <span class="milestone-due"><i class="far fa-calendar-alt"></i> Due: ${dueDate}</span>
        </div>
        <div class="milestone-description">
            <p>${milestone.description}</p>
        </div>
        <div class="milestone-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${milestone.progress}%"></div>
            </div>
            <span class="progress-text">${milestone.progress}% Complete</span>
        </div>
        ${milestone.deliverables && milestone.deliverables.length > 0 ? `
            <div class="milestone-deliverables">
                <h5>Deliverables:</h5>
                <ul>
                    ${milestone.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;

    // Add event listeners
    milestoneCard.querySelector('.milestone-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        openEditMilestoneModal(milestone._id);
    });

    milestoneCard.querySelector('.milestone-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        confirmDeleteMilestone(milestone._id);
    });

    // Add click event to view milestone details
    milestoneCard.addEventListener('click', () => {
        window.location.href = `milestone-details.html?id=${milestone._id}`;
    });

    return milestoneCard;
}

function getStatusIcon(status) {
    switch(status) {
        case 'completed':
            return '<i class="fas fa-check-circle"></i>';
        case 'in-progress':
            return '<i class="fas fa-spinner"></i>';
        case 'not-started':
            return '<i class="fas fa-clock"></i>';
        default:
            return '<i class="fas fa-circle"></i>';
    }
}

function getStatusLabel(status) {
    switch(status) {
        case 'completed':
            return 'Completed';
        case 'in-progress':
            return 'In Progress';
        case 'not-started':
            return 'Not Started';
        default:
            return status;
    }
}

function filterMilestones() {
    const searchInput = document.getElementById('milestone-search');
    const projectFilter = document.getElementById('project-filter');
    const statusFilter = document.getElementById('status-filter');
    const milestoneCards = document.querySelectorAll('.milestone-card');
    const noMilestonesMessage = document.getElementById('no-milestones-message');

    if (!milestoneCards.length) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const projectId = projectFilter ? projectFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';

    let visibleCount = 0;

    milestoneCards.forEach(card => {
        // Get milestone data from the card
        const name = card.querySelector('.milestone-title').textContent.trim();
        const description = card.querySelector('.milestone-description').textContent.trim();
        const cardStatus = card.classList.contains('completed') ? 'completed' :
                       card.classList.contains('in-progress') ? 'in-progress' : 'not-started';
        const cardProjectId = card.dataset.projectId;

        // Check if milestone matches all filters
        const matchesSearch = searchTerm === '' ||
                             name.toLowerCase().includes(searchTerm) ||
                             description.toLowerCase().includes(searchTerm);

        const matchesProject = projectId === 'all' || cardProjectId === projectId;

        const matchesStatus = status === 'all' || cardStatus === status;

        // Show or hide the milestone card
        if (matchesSearch && matchesProject && matchesStatus) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show or hide the no milestones message
    if (noMilestonesMessage) {
        if (visibleCount === 0) {
            noMilestonesMessage.classList.remove('hidden');
        } else {
            noMilestonesMessage.classList.add('hidden');
        }
    }
}

async function openNewMilestoneModal() {
    console.log('openNewMilestoneModal function called');

    try {
        // Create modal HTML
        console.log('Creating milestone modal HTML');
        const modalHTML = await createMilestoneModalHTML('add');

        console.log('Modal HTML created, adding to DOM');
        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        console.log('Initializing modal');
        // Initialize the modal
        initializeMilestoneModal();

        console.log('Modal initialized successfully');
    } catch (error) {
        console.error('Error in openNewMilestoneModal:', error);
        alert('Error opening new milestone modal: ' + error.message);
    }
}

async function openEditMilestoneModal(milestoneId) {
    try {
        // Create modal HTML
        const modalHTML = await createMilestoneModalHTML('edit', milestoneId);

        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialize the modal
        initializeMilestoneModal(milestoneId);
    } catch (error) {
        console.error('Error in openEditMilestoneModal:', error);
        alert('Error opening edit milestone modal: ' + error.message);
    }
}

async function createMilestoneModalHTML(mode, milestoneId = null) {
    console.log('createMilestoneModalHTML called with mode:', mode, 'milestoneId:', milestoneId);

    let milestone = null;
    let modalTitle = 'Add New Milestone';
    let submitButtonText = 'Create Milestone';

    if (mode === 'edit' && milestoneId) {
        try {
            console.log('Fetching milestone by ID:', milestoneId);
            milestone = await fetchMilestoneById(milestoneId);
            if (!milestone) throw new Error('Milestone not found');

            modalTitle = 'Edit Milestone';
            submitButtonText = 'Update Milestone';
        } catch (error) {
            console.error('Error fetching milestone:', error);
            showNotification('Failed to load milestone details', 'error');
            return '';
        }
    }

    // Fetch projects for dropdown
    console.log('Fetching projects for dropdown');
    try {
        const projects = await fetchProjects();
        console.log('Projects fetched:', projects);

        return `
        <div class="modal-overlay" id="milestone-modal-overlay">
            <div class="modal milestone-modal">
                <div class="modal-header">
                    <h3>${modalTitle}</h3>
                    <button type="button" class="close-modal" id="milestone-modal-close" onclick="closeMilestoneModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="milestone-form">
                        <div class="form-group">
                            <label for="milestone-project">Project <span class="required">*</span></label>
                            <select id="milestone-project" required>
                                <option value="">Select Project</option>
                                ${projects.map(project => `
                                    <option value="${project._id}" ${milestone && milestone.projectId && milestone.projectId._id === project._id ? 'selected' : ''}>
                                        ${project.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="milestone-name">Milestone Name <span class="required">*</span></label>
                            <input type="text" id="milestone-name" placeholder="Enter milestone name" required value="${milestone ? milestone.name : ''}">
                        </div>
                        <div class="form-group">
                            <label for="milestone-description">Description <span class="required">*</span></label>
                            <textarea id="milestone-description" placeholder="Enter milestone description" required>${milestone ? milestone.description : ''}</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="milestone-due-date">Due Date <span class="required">*</span></label>
                                <input type="date" id="milestone-due-date" required value="${milestone ? formatDateForInput(milestone.dueDate) : ''}">
                            </div>
                            <div class="form-group">
                                <label for="milestone-status">Status</label>
                                <select id="milestone-status">
                                    <option value="not-started" ${milestone && milestone.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                                    <option value="in-progress" ${milestone && milestone.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="completed" ${milestone && milestone.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="milestone-progress">Progress: <span id="progress-value">${milestone ? milestone.progress : '0'}%</span></label>
                            <input type="range" id="milestone-progress" min="0" max="100" step="5" value="${milestone ? milestone.progress : '0'}">
                        </div>
                        <div class="form-group">
                            <label for="milestone-deliverables">Deliverables (one per line)</label>
                            <textarea id="milestone-deliverables" placeholder="Enter deliverables, one per line">${milestone && milestone.deliverables ? milestone.deliverables.join('\n') : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="cancel-btn" id="milestone-cancel-btn" onclick="closeMilestoneModal()">Cancel</button>
                    <button type="button" class="submit-btn" id="milestone-submit-btn">${submitButtonText}</button>
                </div>
            </div>
        </div>
    `;
    } catch (error) {
        console.error('Error in createMilestoneModalHTML:', error);
        showNotification('Failed to create milestone modal', 'error');
        return '';
    }
}

function initializeMilestoneModal(milestoneId = null) {
    console.log('initializeMilestoneModal function called');

    // Add event listeners
    const closeButton = document.getElementById('milestone-modal-close');
    console.log('Close button element:', closeButton);

    if (closeButton) {
        console.log('Adding click event listener to close button');
        closeButton.addEventListener('click', function(e) {
            console.log('Close button clicked');
            e.preventDefault();
            e.stopPropagation();
            closeMilestoneModal();
        });
    } else {
        console.error('Close button element not found');
    }

    const cancelButton = document.getElementById('milestone-cancel-btn');
    console.log('Cancel button element:', cancelButton);

    if (cancelButton) {
        console.log('Adding click event listener to cancel button');
        cancelButton.addEventListener('click', function(e) {
            console.log('Cancel button clicked');
            e.preventDefault();
            e.stopPropagation();
            closeMilestoneModal();
        });
    } else {
        console.error('Cancel button element not found');
    }

    const submitButton = document.getElementById('milestone-submit-btn');
    console.log('Submit button element:', submitButton);

    if (submitButton) {
        console.log('Adding click event listener to submit button');
        submitButton.addEventListener('click', function(e) {
            console.log('Submit button clicked');
            e.preventDefault();
            e.stopPropagation();
            submitMilestoneForm(milestoneId);
        });
    } else {
        console.error('Submit button element not found');
    }

    // Add progress range input listener
    const progressInput = document.getElementById('milestone-progress');
    const progressValue = document.getElementById('progress-value');

    if (progressInput && progressValue) {
        console.log('Adding input event listener to progress input');
        progressInput.addEventListener('input', function() {
            progressValue.textContent = this.value + '%';
        });
    } else {
        console.error('Progress input or value element not found');
    }

    // Add status change listener to update progress automatically
    const statusSelect = document.getElementById('milestone-status');

    if (statusSelect && progressInput && progressValue) {
        console.log('Adding change event listener to status select');
        statusSelect.addEventListener('change', function() {
            if (this.value === 'completed') {
                progressInput.value = 100;
                progressValue.textContent = '100%';
            } else if (this.value === 'not-started' && progressInput.value === '0') {
                progressInput.value = 0;
                progressValue.textContent = '0%';
            }
        });
    } else {
        console.error('Status select, progress input, or progress value element not found');
    }

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    console.log('Body overflow set to hidden');
}

function closeMilestoneModal() {
    console.log('closeMilestoneModal function called');
    const modalOverlay = document.getElementById('milestone-modal-overlay');
    console.log('Modal overlay element:', modalOverlay);

    if (modalOverlay) {
        console.log('Removing modal overlay');
        modalOverlay.remove();
        console.log('Modal overlay removed');
    } else {
        console.error('Modal overlay element not found');
    }

    document.body.style.overflow = '';
    console.log('Body overflow reset');
}

async function submitMilestoneForm(milestoneId = null) {
    try {
        // Get form values
        const projectId = document.getElementById('milestone-project').value;
        const name = document.getElementById('milestone-name').value;
        const description = document.getElementById('milestone-description').value;
        const dueDate = document.getElementById('milestone-due-date').value;
        const status = document.getElementById('milestone-status').value;
        const progress = document.getElementById('milestone-progress').value;
        const deliverablesText = document.getElementById('milestone-deliverables').value;

        // Validate required fields
        if (!projectId || !name || !description || !dueDate) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Parse deliverables
        const deliverables = deliverablesText
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');

        // Create milestone object
        const milestoneData = {
            projectId,
            name,
            description,
            dueDate,
            status,
            progress: parseInt(progress),
            deliverables
        };

        let result;

        if (milestoneId) {
            // Update existing milestone
            result = await updateMilestone(milestoneId, milestoneData);
        } else {
            // Create new milestone
            result = await createMilestone(milestoneData);
        }

        if (result) {
            // Close modal
            closeMilestoneModal();

            // Reload milestones
            await loadAllMilestones();

            // Show success message
            showNotification(
                milestoneId ? 'Milestone updated successfully' : 'Milestone created successfully',
                'success'
            );
        }
    } catch (error) {
        console.error('Error submitting milestone form:', error);
        showNotification('Failed to save milestone', 'error');
    }
}

async function confirmDeleteMilestone(milestoneId) {
    // Create confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirmation-dialog';
    confirmDialog.innerHTML = `
        <div class="confirmation-content">
            <h3>Delete Milestone</h3>
            <p>Are you sure you want to delete this milestone? This action cannot be undone.</p>
            <div class="confirmation-actions">
                <button type="button" class="cancel-btn" id="cancel-delete">Cancel</button>
                <button type="button" class="delete-btn" id="confirm-delete">Delete</button>
            </div>
        </div>
    `;

    // Add dialog to the DOM
    document.body.appendChild(confirmDialog);

    // Add event listeners
    document.getElementById('cancel-delete').addEventListener('click', () => {
        confirmDialog.remove();
    });

    document.getElementById('confirm-delete').addEventListener('click', async () => {
        try {
            // Delete milestone
            const result = await deleteMilestone(milestoneId);

            if (result) {
                // Remove dialog
                confirmDialog.remove();

                // Reload milestones
                await loadAllMilestones();

                // Show success message
                showNotification('Milestone deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting milestone:', error);
            showNotification('Failed to delete milestone', 'error');
        }
    });
}

// Helper functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function showLoadingOverlay(message = 'Loading...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Make closeMilestoneModal globally available
window.closeMilestoneModal = function() {
    console.log('Global closeMilestoneModal function called');
    const modalOverlay = document.getElementById('milestone-modal-overlay');
    console.log('Modal overlay element:', modalOverlay);

    if (modalOverlay) {
        console.log('Removing modal overlay');
        modalOverlay.remove();
        console.log('Modal overlay removed');
    } else {
        console.error('Modal overlay element not found');
    }

    document.body.style.overflow = '';
    console.log('Body overflow reset');
};
// Milestones page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the milestones page
    initializeMilestonesPage();

    // Set up event listeners
    setupMilestonesPageEventListeners();

    // Check for hash fragments for quick actions
    checkForQuickActions();
});

function checkForQuickActions() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Check for edit parameter
    const editMilestoneId = urlParams.get('edit');
    if (editMilestoneId) {
        // Open edit modal for the specified milestone
        setTimeout(() => {
            openEditMilestoneModal(editMilestoneId);
        }, 500); // Small delay to ensure page is loaded
        return;
    }

    // Check for new parameter
    const newMilestone = urlParams.get('new');
    if (newMilestone === 'true') {
        // Open new milestone modal
        setTimeout(() => {
            openNewMilestoneModal();
        }, 500); // Small delay to ensure page is loaded
        return;
    }

    // Check if there's a hash in the URL
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);

        // Handle different quick actions
        if (hash === 'new-milestone') {
            // Trigger new milestone button click
            const newMilestoneBtn = document.getElementById('new-milestone-btn');
            if (newMilestoneBtn) {
                newMilestoneBtn.click();
            }
        }
    }
}

async function initializeMilestonesPage() {
    try {
        // Show loading overlay
        showLoadingOverlay('Loading milestones...');

        // Update user information in the header
        await updateUserInfo();

        // Load projects for the filter dropdown
        await loadProjectsForFilter();

        // Load all milestones
        await loadAllMilestones();

        // Hide loading overlay
        hideLoadingOverlay();
    } catch (error) {
        console.error('Error initializing milestones page:', error);
        showNotification('Failed to load milestones', 'error');
        hideLoadingOverlay();
    }
}

async function updateUserInfo() {
    try {
        // Fetch current user
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Update welcome message
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage && userData) {
            welcomeMessage.textContent = `Welcome, ${userData.name}`;
        }

        // Update avatar
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar && userData && userData.avatar) {
            const avatarImg = userAvatar.querySelector('img');
            if (avatarImg) {
                avatarImg.src = userData.avatar;
                avatarImg.alt = userData.name;
            }
        }
    } catch (error) {
        console.error('Error updating user info:', error);
        // Don't show notification for this error as it's not critical
    }
}

function setupMilestonesPageEventListeners() {
    // New milestone button
    const newMilestoneBtn = document.getElementById('new-milestone-btn');
    if (newMilestoneBtn) {
        newMilestoneBtn.addEventListener('click', openNewMilestoneModal);
    }

    // Empty state new milestone button
    const emptyStateNewMilestoneBtn = document.getElementById('empty-state-new-milestone-btn');
    if (emptyStateNewMilestoneBtn) {
        emptyStateNewMilestoneBtn.addEventListener('click', openNewMilestoneModal);
    }

    // Search input
    const searchInput = document.getElementById('milestone-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterMilestones);
    }

    // Filter dropdowns
    const projectFilter = document.getElementById('project-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');

    if (projectFilter) projectFilter.addEventListener('change', filterMilestones);
    if (statusFilter) statusFilter.addEventListener('change', filterMilestones);
    if (dateFilter) dateFilter.addEventListener('change', filterMilestones);
}

async function loadProjectsForFilter() {
    try {
        const projectFilter = document.getElementById('project-filter');
        if (!projectFilter) return;

        // Fetch projects from API
        const projects = await fetchProjects();

        // Clear existing options except the first one
        while (projectFilter.options.length > 1) {
            projectFilter.remove(1);
        }

        // Add projects to the dropdown
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project._id;
            option.textContent = project.name;
            projectFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading projects for filter:', error);
        showNotification('Failed to load projects', 'error');
    }
}

async function loadAllMilestones() {
    try {
        const milestonesList = document.getElementById('milestones-list');
        const noMilestonesMessage = document.getElementById('no-milestones-message');

        if (!milestonesList || !noMilestonesMessage) return;

        // Clear existing content
        milestonesList.innerHTML = '';

        // Fetch all milestones
        const milestones = await fetchMilestones();

        // If no milestones, show empty state
        if (!milestones || milestones.length === 0) {
            milestonesList.innerHTML = '';
            noMilestonesMessage.classList.remove('hidden');
            return;
        }

        // Hide no milestones message
        noMilestonesMessage.classList.add('hidden');

        // Sort milestones by due date (closest first)
        milestones.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // Render each milestone
        milestones.forEach((milestone, index) => {
            const milestoneCard = createMilestoneCard(milestone);

            // Add a staggered entrance animation
            milestoneCard.style.opacity = '0';
            milestoneCard.style.transform = 'translateY(10px)';

            milestonesList.appendChild(milestoneCard);

            // Trigger the animation with a staggered delay
            setTimeout(() => {
                milestoneCard.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                milestoneCard.style.opacity = '1';
                milestoneCard.style.transform = 'translateY(0)';
            }, 50 * index);
        });
    } catch (error) {
        console.error('Error loading milestones:', error);
        showNotification('Failed to load milestones', 'error');
    }
}

function createMilestoneCard(milestone) {
    // Create milestone card element
    const milestoneCard = document.createElement('div');
    milestoneCard.className = `milestone-card ${milestone.status}`;
    milestoneCard.dataset.id = milestone._id;

    // Store project ID for filtering
    if (milestone.projectId && milestone.projectId._id) {
        milestoneCard.dataset.projectId = milestone.projectId._id;
    }

    // Format dates
    const dueDate = formatDate(milestone.dueDate);

    // Get status icon
    const statusIcon = getStatusIcon(milestone.status);

    // Get project name
    const projectName = milestone.projectId ? milestone.projectId.name : 'Unknown Project';

    // Create milestone card HTML
    milestoneCard.innerHTML = `
        <div class="milestone-header">
            <div>
                <h3 class="milestone-title">
                    ${statusIcon}
                    ${milestone.name}
                </h3>
                <div class="milestone-project">
                    <i class="fas fa-project-diagram"></i> ${projectName}
                </div>
            </div>
            <div class="milestone-actions">
                <button type="button" class="milestone-edit-btn" title="Edit milestone">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="milestone-delete-btn" title="Delete milestone">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="milestone-meta">
            <span class="milestone-status ${milestone.status}">${getStatusLabel(milestone.status)}</span>
            <span class="milestone-due"><i class="far fa-calendar-alt"></i> Due: ${dueDate}</span>
        </div>
        <div class="milestone-description">
            <p>${milestone.description}</p>
        </div>
        <div class="milestone-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${milestone.progress}%"></div>
            </div>
            <span class="progress-text">${milestone.progress}% Complete</span>
        </div>
        ${milestone.deliverables && milestone.deliverables.length > 0 ? `
            <div class="milestone-deliverables">
                <h5>Deliverables:</h5>
                <ul>
                    ${milestone.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;

    // Add event listeners
    milestoneCard.querySelector('.milestone-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        openEditMilestoneModal(milestone._id);
    });

    milestoneCard.querySelector('.milestone-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        confirmDeleteMilestone(milestone._id);
    });

    // Add click event to view milestone details
    milestoneCard.addEventListener('click', () => {
        window.location.href = `milestone-details.html?id=${milestone._id}`;
    });

    return milestoneCard;
}

function getStatusIcon(status) {
    switch(status) {
        case 'completed':
            return '<i class="fas fa-check-circle"></i>';
        case 'in-progress':
            return '<i class="fas fa-spinner"></i>';
        case 'not-started':
            return '<i class="fas fa-clock"></i>';
        default:
            return '<i class="fas fa-circle"></i>';
    }
}

function getStatusLabel(status) {
    switch(status) {
        case 'completed':
            return 'Completed';
        case 'in-progress':
            return 'In Progress';
        case 'not-started':
            return 'Not Started';
        default:
            return status;
    }
}

function filterMilestones() {
    const searchInput = document.getElementById('milestone-search');
    const projectFilter = document.getElementById('project-filter');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const milestoneCards = document.querySelectorAll('.milestone-card');
    const noMilestonesMessage = document.getElementById('no-milestones-message');

    if (!milestoneCards.length) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const projectId = projectFilter ? projectFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';
    const dateRange = dateFilter ? dateFilter.value : '';

    let visibleCount = 0;

    milestoneCards.forEach(card => {
        const milestone = {
            id: card.dataset.id,
            name: card.querySelector('.milestone-title').textContent.trim(),
            description: card.querySelector('.milestone-description').textContent.trim(),
            status: card.classList.contains('completed') ? 'completed' :
                   card.classList.contains('in-progress') ? 'in-progress' : 'not-started',
            projectId: card.querySelector('.milestone-project') ?
                      card.querySelector('.milestone-project').textContent.trim().split('Project:')[1]?.trim() : '',
            dueDate: card.querySelector('.milestone-due').textContent.trim().split('Due:')[1]?.trim()
        };

        // Check if milestone matches all filters
        const matchesSearch = searchTerm === '' ||
                             milestone.name.toLowerCase().includes(searchTerm) ||
                             milestone.description.toLowerCase().includes(searchTerm);

        const matchesProject = projectId === '' || card.dataset.projectId === projectId;

        const matchesStatus = status === '' || milestone.status === status;

        const matchesDate = dateRange === '' || isInDateRange(milestone.dueDate, dateRange);

        // Show or hide the milestone card
        if (matchesSearch && matchesProject && matchesStatus && matchesDate) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show or hide the no milestones message
    if (noMilestonesMessage) {
        if (visibleCount === 0) {
            noMilestonesMessage.classList.remove('hidden');
        } else {
            noMilestonesMessage.classList.add('hidden');
        }
    }
}

function isInDateRange(dateString, range) {
    if (!dateString) return false;

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch(range) {
        case 'today':
            return date >= today && date < tomorrow;
        case 'this-week':
            return date >= weekStart && date < weekEnd;
        case 'this-month':
            return date >= monthStart && date <= monthEnd;
        case 'overdue':
            return date < today;
        default:
            return true;
    }
}

async function openNewMilestoneModal() {
    // Primary check: Use the flag first
    if (isMilestoneModalInitializing) {
        console.log('Milestone modal already being initialized, preventing duplicate');
        return;
    }

    try {
        // Set the flag to prevent concurrent initializations
        isMilestoneModalInitializing = true;
        console.log('Setting milestone modal initialization flag');

        // Secondary DOM check
        const existingModal = document.getElementById('milestone-modal-overlay');
        if (existingModal) {
            console.log('Milestone modal already exists in DOM, using existing modal');
            return;
        }

        // Create modal HTML
        const modalHTML = await createMilestoneModalHTML('add');

        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialize the modal with a small delay to ensure DOM is updated
        setTimeout(() => {
            try {
                // Final safety check for duplicates (should never be hit with our new approach)
                const existingModals = document.querySelectorAll('#milestone-modal-overlay');
                if (existingModals.length > 1) {
                    console.warn('Multiple milestone modals detected, removing extras');
                    // Keep only the first one
                    for (let i = 1; i < existingModals.length; i++) {
                        existingModals[i].remove();
                    }
                }

                initializeMilestoneModal();
            } catch (error) {
                console.error('Error in initializeMilestoneModal:', error);
                alert('Error initializing milestone modal: ' + error.message);
                // Reset the flag in case of error
                isMilestoneModalInitializing = false;
                console.log('Modal initialization flag reset due to error');
            }
        }, 50);
    } catch (error) {
        console.error('Error in openNewMilestoneModal:', error);
        // Reset the flag in case of error
        isMilestoneModalInitializing = false;
        console.log('Modal initialization flag reset due to error');
        throw error;
    }
}

async function openEditMilestoneModal(milestoneId) {
    // Primary check: Use the flag first
    if (isMilestoneModalInitializing) {
        console.log('Milestone modal already being initialized, preventing duplicate');
        return;
    }

    try {
        // Set the flag to prevent concurrent initializations
        isMilestoneModalInitializing = true;
        console.log('Setting milestone modal initialization flag');

        // Secondary DOM check
        const existingModal = document.getElementById('milestone-modal-overlay');
        if (existingModal) {
            console.log('Milestone modal already exists in DOM, using existing modal');
            return;
        }

        // Create modal HTML
        const modalHTML = await createMilestoneModalHTML('edit', milestoneId);

        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialize the modal with a small delay to ensure DOM is updated
        setTimeout(() => {
            try {
                // Final safety check for duplicates (should never be hit with our new approach)
                const existingModals = document.querySelectorAll('#milestone-modal-overlay');
                if (existingModals.length > 1) {
                    console.warn('Multiple milestone modals detected, removing extras');
                    // Keep only the first one
                    for (let i = 1; i < existingModals.length; i++) {
                        existingModals[i].remove();
                    }
                }

                initializeMilestoneModal();
            } catch (error) {
                console.error('Error in initializeMilestoneModal:', error);
                alert('Error initializing milestone modal: ' + error.message);
                // Reset the flag in case of error
                isMilestoneModalInitializing = false;
                console.log('Modal initialization flag reset due to error');
            }
        }, 50);
    } catch (error) {
        console.error('Error in openEditMilestoneModal:', error);
        // Reset the flag in case of error
        isMilestoneModalInitializing = false;
        console.log('Modal initialization flag reset due to error');
        throw error;
    }
}

async function createMilestoneModalHTML(mode, milestoneId = null) {
    let milestone = null;
    let modalTitle = 'Add New Milestone';
    let submitButtonText = 'Create Milestone';

    // Handle both 'add' and 'new' modes for consistency
    if ((mode === 'edit' || mode === 'update') && milestoneId) {
        try {
            milestone = await fetchMilestoneById(milestoneId);
            if (!milestone) throw new Error('Milestone not found');

            modalTitle = 'Edit Milestone';
            submitButtonText = 'Update Milestone';
        } catch (error) {
            console.error('Error fetching milestone:', error);
            showNotification('Failed to load milestone details', 'error');
            return '';
        }
    }

    console.log('Creating milestone modal HTML with mode:', mode);

    // Fetch projects for dropdown
    const projects = await fetchProjects();

    return `
        <div class="modal-overlay" id="milestone-modal-overlay">
            <div class="modal milestone-modal">
                <div class="modal-header">
                    <h3>${modalTitle}</h3>
                    <button type="button" class="close-modal" id="milestone-modal-close" onclick="closeMilestoneModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="milestone-form">
                        <div class="form-group">
                            <label for="milestone-project">Project <span class="required">*</span></label>
                            <select id="milestone-project" required>
                                <option value="">Select Project</option>
                                ${projects.map(project => `
                                    <option value="${project._id}" ${milestone && milestone.projectId && milestone.projectId._id === project._id ? 'selected' : ''}>
                                        ${project.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="milestone-name">Milestone Name <span class="required">*</span></label>
                            <input type="text" id="milestone-name" placeholder="Enter milestone name" required value="${milestone ? milestone.name : ''}">
                        </div>
                        <div class="form-group">
                            <label for="milestone-description">Description <span class="required">*</span></label>
                            <textarea id="milestone-description" placeholder="Enter milestone description" required>${milestone ? milestone.description : ''}</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="milestone-due-date">Due Date <span class="required">*</span></label>
                                <input type="date" id="milestone-due-date" required value="${milestone ? formatDateForInput(milestone.dueDate) : ''}">
                            </div>
                            <div class="form-group">
                                <label for="milestone-status">Status</label>
                                <select id="milestone-status">
                                    <option value="not-started" ${milestone && milestone.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                                    <option value="in-progress" ${milestone && milestone.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="completed" ${milestone && milestone.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="milestone-progress">Progress: <span id="progress-value">${milestone ? milestone.progress : '0'}%</span></label>
                            <input type="range" id="milestone-progress" min="0" max="100" step="5" value="${milestone ? milestone.progress : '0'}">
                        </div>
                        <div class="form-group">
                            <label for="milestone-deliverables">Deliverables (one per line)</label>
                            <textarea id="milestone-deliverables" placeholder="Enter deliverables, one per line">${milestone && milestone.deliverables ? milestone.deliverables.join('\n') : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="cancel-btn" id="milestone-cancel-btn" onclick="closeMilestoneModal()">Cancel</button>
                    <button type="button" class="submit-btn" id="milestone-submit-btn" onclick="submitMilestoneForm(${milestoneId ? `'${milestoneId}'` : 'null'})">${submitButtonText}</button>
                </div>
            </div>
        </div>
    `;
}

function initializeMilestoneModal() {
    console.log('Initializing milestone modal');

    try {
        // Get elements
        const closeBtn = document.getElementById('milestone-modal-close');
        const cancelBtn = document.getElementById('milestone-cancel-btn');
        const submitBtn = document.getElementById('milestone-submit-btn');
        const progressInput = document.getElementById('milestone-progress');
        const progressValue = document.getElementById('progress-value');
        const statusSelect = document.getElementById('milestone-status');

        // Check if elements exist
        if (!closeBtn) throw new Error('Close button not found');
        if (!cancelBtn) throw new Error('Cancel button not found');
        if (!submitBtn) throw new Error('Submit button not found');
        if (!progressInput) throw new Error('Progress input not found');
        if (!progressValue) throw new Error('Progress value not found');
        if (!statusSelect) throw new Error('Status select not found');

        // Only use one method for event handling - we'll use the onclick attributes
        // that are already in the HTML
        console.log('Using inline onclick attributes for button handlers');

        // Add progress range input listener
        progressInput.addEventListener('input', function() {
            progressValue.textContent = this.value + '%';
        });

        // Add status change listener to update progress automatically
        statusSelect.addEventListener('change', function() {
            if (this.value === 'completed') {
                progressInput.value = 100;
                progressValue.textContent = '100%';
            } else if (this.value === 'not-started' && progressInput.value === '0') {
                progressInput.value = 0;
                progressValue.textContent = '0%';
            }
        });

        // Prevent background scrolling
        document.body.style.overflow = 'hidden';

        console.log('Milestone modal initialized successfully');
    } catch (error) {
        console.error('Error initializing milestone modal:', error);
        throw error;
    }
}

function closeMilestoneModal() {
    console.log('Closing milestone modal');
    try {
        // Get all modal overlays (in case there are multiple)
        const modalOverlays = document.querySelectorAll('#milestone-modal-overlay');
        console.log('Modal overlay elements found:', modalOverlays.length);

        if (modalOverlays.length > 0) {
            // Remove all modal overlays
            modalOverlays.forEach(overlay => {
                overlay.remove();
                console.log('Modal overlay removed');
            });
            console.log('All modal overlays removed successfully');
        } else {
            console.warn('No modal overlay elements found');
        }

        // Restore body scrolling
        document.body.style.overflow = '';
        console.log('Body overflow restored');
    } catch (error) {
        console.error('Error in closeMilestoneModal:', error);
    }
}

async function submitMilestoneForm(milestoneId = null) {
    try {
        // Get form values
        const projectId = document.getElementById('milestone-project').value;
        const name = document.getElementById('milestone-name').value;
        const description = document.getElementById('milestone-description').value;
        const dueDate = document.getElementById('milestone-due-date').value;
        const status = document.getElementById('milestone-status').value;
        const progress = document.getElementById('milestone-progress').value;
        const deliverablesText = document.getElementById('milestone-deliverables').value;

        // Validate required fields
        if (!projectId || !name || !description || !dueDate) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Parse deliverables
        const deliverables = deliverablesText
            .split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');

        // Create milestone object
        const milestoneData = {
            projectId,
            name,
            description,
            dueDate,
            status,
            progress: parseInt(progress),
            deliverables
        };

        let result;

        if (milestoneId) {
            // Update existing milestone
            result = await updateMilestone(milestoneId, milestoneData);
        } else {
            // Create new milestone
            result = await createMilestone(milestoneData);
        }

        if (result) {
            // Close modal
            closeMilestoneModal();

            // Show success message
            showNotification(
                milestoneId ? 'Milestone updated successfully' : 'Milestone created successfully',
                'success'
            );

            // Force page reload to ensure all data is fresh
            console.log('Reloading page to refresh milestone list');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error submitting milestone form:', error);
        showNotification('Failed to save milestone', 'error');
    }
}

async function confirmDeleteMilestone(milestoneId) {
    // Create confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirmation-dialog';
    confirmDialog.innerHTML = `
        <div class="confirmation-content">
            <h3>Delete Milestone</h3>
            <p>Are you sure you want to delete this milestone? This action cannot be undone.</p>
            <div class="confirmation-actions">
                <button type="button" class="cancel-btn" id="cancel-delete">Cancel</button>
                <button type="button" class="delete-btn" id="confirm-delete">Delete</button>
            </div>
        </div>
    `;

    // Add dialog to the DOM
    document.body.appendChild(confirmDialog);

    // Add event listeners
    document.getElementById('cancel-delete').addEventListener('click', () => {
        confirmDialog.remove();
    });

    document.getElementById('confirm-delete').addEventListener('click', async () => {
        try {
            // Delete milestone
            const result = await deleteMilestone(milestoneId);

            if (result) {
                // Remove dialog
                confirmDialog.remove();

                // Show success message
                showNotification('Milestone deleted successfully', 'success');

                // Force page reload to ensure all data is fresh
                console.log('Reloading page to refresh milestone list');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting milestone:', error);
            showNotification('Failed to delete milestone', 'error');
        }
    });
}

// Helper functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function showLoadingOverlay(message = 'Loading...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}
