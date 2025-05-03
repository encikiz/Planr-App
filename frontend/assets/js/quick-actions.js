// Quick Actions Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize quick actions
    initQuickActions();
});

function initQuickActions() {
    // Set up event listeners for quick action buttons
    const quickActionButtons = document.querySelectorAll('.quick-action-card');
    
    quickActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
}

function handleQuickAction(action) {
    switch(action) {
        case 'new-project':
            // Navigate to projects page with new project modal trigger
            window.location.href = 'pages/projects.html?action=new';
            break;
            
        case 'new-task':
            // Navigate to tasks page with new task modal trigger
            window.location.href = 'pages/tasks.html?action=new';
            break;
            
        case 'add-member':
            // Navigate to team page with new member modal trigger
            window.location.href = 'pages/team.html?action=new-member';
            break;
            
        case 'create-team':
            // Navigate to team page with new team modal trigger
            window.location.href = 'pages/team.html?action=new-team';
            break;
            
        default:
            console.log('Unknown action:', action);
    }
}

// Function to show notification
function showQuickActionNotification(message, type = 'info') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        console.log('Notification:', message, '(Type:', type, ')');
    }
}
