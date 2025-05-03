/**
 * Planr Application - Main JavaScript File
 *
 * This file contains utility functions and UI enhancements for the Planr application.
 * All data is fetched from API endpoints.
 */

// Helper functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getStatusLabel(status) {
    switch (status) {
        case 'not-started':
            return 'Not Started';
        case 'planning':
            return 'Planning';
        case 'in-progress':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        default:
            return status;
    }
}

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

// Using the global showNotification function from notification.js

// Animation functions
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
        const width = bar.getAttribute('data-progress') + '%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100 + (index * 50)); // Stagger the animations
    });
}

// Add subtle entrance animations to elements
function animateEntranceEffects() {
    // Animate metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });

    // Animate section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach((header, index) => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(15px)';
        setTimeout(() => {
            header.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });

    // Animate content sections
    const contentSections = document.querySelectorAll('.projects-overview, .progress-visualization, .recent-activity');
    contentSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        setTimeout(() => {
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 500 + (index * 150));
    });
}

// Add ripple effect to buttons
function addButtonRippleEffect() {
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Initialize any common elements
document.addEventListener('DOMContentLoaded', function() {
    // Show loading overlay
    showLoadingOverlay();

    // Check authentication status
    checkAuthStatus()
        .then(isAuthenticated => {
            if (!isAuthenticated) {
                // Redirect to login page if not authenticated
                window.location.href = '/login';
                return;
            }

            // Simulate loading time (remove in production and replace with actual data loading)
            setTimeout(() => {
                // Hide loading overlay
                hideLoadingOverlay();

                // Add ripple effect to buttons
                addButtonRippleEffect();

                // Add entrance animations
                animateEntranceEffects();

                // Add hover effects to project cards
                addHoverEffects();

                console.log('Planr application initialized');
            }, 1500); // Simulate 1.5 seconds loading time
        });
});

// Check if user is authenticated
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/user');

        if (response.ok) {
            // User is authenticated
            const userData = await response.json();
            updateUserProfile(userData);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// Update user profile in the header
function updateUserProfile(user) {
    const userProfileElement = document.querySelector('.user-profile span');
    const avatarElement = document.querySelector('.user-profile .avatar img');

    if (userProfileElement && user) {
        userProfileElement.textContent = `Welcome, ${user.name}`;
    }

    if (avatarElement && user && user.avatar) {
        avatarElement.src = user.avatar;
        avatarElement.alt = user.name;
    }

    // If user is guest, add guest badge and disable edit features
    if (user.isGuest) {
        // Add guest badge
        const userProfile = document.querySelector('.user-profile');
        if (userProfile && !userProfile.querySelector('.guest-badge')) {
            const guestBadge = document.createElement('div');
            guestBadge.className = 'guest-badge';
            guestBadge.textContent = 'Guest';
            userProfile.appendChild(guestBadge);
        }

        // Disable edit buttons for guest users
        disableEditFeaturesForGuest();
    }

    // Setup logout button functionality
    setupLogoutButton();
}

function setupLogoutButton() {
    // First, handle any existing logout buttons
    const existingLogoutButtons = document.querySelectorAll('.logout-btn');
    existingLogoutButtons.forEach(button => {
        // Remove existing event listeners by cloning and replacing
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add click event listener to the new button
        newButton.addEventListener('click', function() {
            console.log('Logout button clicked');
            handleLogout();
        });
    });

    // Then, add a new logout button if needed
    const userProfile = document.querySelector('.user-profile');
    if (userProfile && !userProfile.querySelector('.logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span class="logout-text">Logout</span>';
        logoutBtn.title = 'Logout';

        logoutBtn.addEventListener('click', function() {
            console.log('Logout button clicked');
            handleLogout();
        });

        userProfile.appendChild(logoutBtn);
    }
}

// Function to handle logout
function handleLogout() {
    // Show a notification
    showNotification('Logging out...', 'info');

    // Perform logout
    fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            // Redirect to login page
            window.location.href = '/login';
        } else {
            // If server-side logout fails, still redirect to login
            console.error('Logout failed on server, redirecting anyway');
            window.location.href = '/login';
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
        // Even if there's an error, redirect to login
        window.location.href = '/login';
    });
}

function disableEditFeaturesForGuest() {
    // Disable all "new" buttons
    const newButtons = document.querySelectorAll('.new-project-btn, .new-task-btn, .new-member-btn, [data-action="new-project"], [data-action="new-task"], [data-action="new-member"]');
    newButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
        button.title = 'Guest users cannot create new items';

        // Remove event listeners by cloning and replacing
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add click handler to show guest restriction message
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            showGuestRestrictionMessage();
        });
    });

    // Disable all edit and delete buttons
    const editButtons = document.querySelectorAll('.edit-btn, .delete-btn, [data-action="edit"], [data-action="delete"]');
    editButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
        button.title = 'Guest users cannot modify items';

        // Remove event listeners by cloning and replacing
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add click handler to show guest restriction message
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            showGuestRestrictionMessage();
        });
    });
}

function showGuestRestrictionMessage() {
    // Show a notification that guest users have view-only access
    showNotification('Guest accounts have view-only access. Please login with Google to edit.', 'info');
}

// Show loading overlay
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');

        // Remove from DOM after transition completes
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 500); // Match the transition duration
    }
}

// Add hover effects to various elements
function addHoverEffects() {
    // Add hover effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
        });
    });

    // Add hover effect to activity items
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.backgroundColor = 'var(--background-alt)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.backgroundColor = 'transparent';
        });
    });
}

// All data should be fetched from the API endpoints
// Example:
// - Use fetch('/api/projects') for projects
// - Use fetch('/api/tasks') for tasks
// - Use fetch('/api/users') for team members
