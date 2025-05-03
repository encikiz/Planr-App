// Login page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize login page
    initLoginPage();
});

function initLoginPage() {
    // Add animation to login card
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        setTimeout(() => {
            loginCard.style.opacity = '1';
            loginCard.style.transform = 'translateY(0)';
        }, 100);
    }

    // Add event listeners to login buttons
    const googleLoginBtn = document.querySelector('.google-login-btn');
    const guestLoginBtn = document.querySelector('.guest-login-btn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function(e) {
            // The href will handle the redirect to Google OAuth
            // This is just for visual feedback
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Redirecting...</span>';
        });
    }

    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', function(e) {
            // The href will handle the redirect to guest login
            // This is just for visual feedback
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>';
        });
    }

    // Check if user is already logged in
    checkAuthStatus();
}

// Check if user is already authenticated
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/user');

        if (response.ok) {
            // User is authenticated, redirect to dashboard
            console.log('User is already authenticated, redirecting to dashboard');
            window.location.href = '/';
        } else if (response.status === 401) {
            // User is not authenticated, this is expected on the login page
            console.log('User is not authenticated (401). Showing login page.');
            // Make sure the login form is visible
            const loginCard = document.querySelector('.login-card');
            if (loginCard) {
                loginCard.style.display = 'block';
            }
        } else {
            // Handle other HTTP errors
            console.error(`Auth check failed with status ${response.status}`);
            // Show an error message if needed
        }
    } catch (error) {
        // Handle network errors
        console.error('Auth check error:', error);
        // Show a connection error message if needed
    }
}
