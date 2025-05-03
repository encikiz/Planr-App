// Theme Switcher for Planr

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();

    // Add event listener to theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

/**
 * Initialize theme based on user preference or system preference
 */
function initializeTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('planr-theme');

    if (savedTheme) {
        // Apply saved theme
        setTheme(savedTheme);
    } else {
        // Check for system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }

        // Listen for changes in system preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    // Update toggle button icon
    updateToggleIcon();
}

/**
 * Set the theme
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('planr-theme', theme);
    updateToggleIcon();
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    setTheme(newTheme);

    // Add animation effect
    animateThemeChange();
}

/**
 * Update the toggle button icon based on current theme
 */
function updateToggleIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-lightbulb"></i>';
        themeToggle.setAttribute('title', 'Switch to Light Mode');
    } else {
        themeToggle.innerHTML = '<i class="far fa-lightbulb"></i>';
        themeToggle.setAttribute('title', 'Switch to Dark Mode');
    }
}

/**
 * Add a subtle animation effect when changing themes
 */
function animateThemeChange() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => {
        overlay.style.opacity = '0.2';

        setTimeout(() => {
            overlay.style.opacity = '0';

            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }, 200);
    }, 10);
}
