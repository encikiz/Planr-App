// Authentication functionality for Planr

let currentUser = null;
let isGuest = false;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    initAuth();
});

async function initAuth() {
    try {
        // Check if user is authenticated
        const response = await fetch('/api/auth/user');
        
        if (response.ok) {
            // User is authenticated
            const userData = await response.json();
            currentUser = userData;
            isGuest = userData.isGuest || false;
            
            // Update UI based on authentication
            updateAuthUI();
        } else {
            // User is not authenticated, redirect to login
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        // Handle error - could redirect to login or show error message
    }
}

function updateAuthUI() {
    // Update user profile section
    const userProfileElement = document.querySelector('.user-profile span');
    const avatarElement = document.querySelector('.user-profile .avatar img');
    
    if (userProfileElement && currentUser) {
        userProfileElement.textContent = `Welcome, ${currentUser.name}`;
    }
    
    if (avatarElement && currentUser && currentUser.avatar) {
        avatarElement.src = currentUser.avatar;
        avatarElement.alt = currentUser.name;
    }
    
    // If user is guest, add guest badge and disable edit features
    if (isGuest) {
        // Add guest badge
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            const guestBadge = document.createElement('div');
            guestBadge.className = 'guest-badge';
            guestBadge.textContent = 'Guest';
            userProfile.appendChild(guestBadge);
        }
        
        // Disable edit buttons for guest users
        disableEditFeaturesForGuest();
    }
    
    // Add logout button to user profile
    addLogoutButton();
}

function addLogoutButton() {
    const userProfile = document.querySelector('.user-profile');
    
    if (userProfile) {
        // Check if logout button already exists
        if (!document.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'logout-btn';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
            logoutBtn.title = 'Logout';
            
            logoutBtn.addEventListener('click', function() {
                window.location.href = '/api/auth/logout';
            });
            
            userProfile.appendChild(logoutBtn);
        }
    }
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
    if (typeof showNotification === 'function') {
        showNotification('Guest accounts have view-only access. Please login with Google to edit.', 'info');
    } else {
        alert('Guest accounts have view-only access. Please login with Google to edit.');
    }
}
