/**
 * Global Notification System
 * 
 * This file provides a centralized notification system for the entire application.
 * It displays non-intrusive notifications for success, error, warning, and info messages.
 */

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification: 'success', 'error', 'warning', or 'info'
 * @param {number} duration - How long to display the notification in milliseconds (default: 1500)
 */
function showNotification(message, type = 'info', duration = 1500) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Set icon based on notification type
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';

    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="notification-content">
            <span>${message}</span>
        </div>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to the DOM
    document.body.appendChild(notification);

    // Add close button event listener
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 400);
    });

    // Auto-remove after specified duration
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 400);
        }
    }, duration);

    // Add entrance animation with a slight delay for smoother appearance
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            notification.classList.add('active');
        });
    });
}

// Make sure the function is globally available
window.showNotification = showNotification;
