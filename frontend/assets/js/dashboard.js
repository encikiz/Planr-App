// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // After the main loading overlay is hidden
    const initializeDashboard = () => {
        // Initialize dashboard metrics with shimmer effect
        const metricsSection = document.querySelector('.metrics-section');
        showMetricsShimmer(metricsSection);

        // Simulate loading delay for metrics
        setTimeout(() => {
            initializeDashboardMetrics();

            // Load project cards
            loadProjectCards();

            // Initialize progress chart
            initializeProgressChart();

            // Load recent activity
            loadRecentActivity();
        }, 500);
    };

    // Check if the loading overlay exists and is visible
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
        // Wait for the main loading overlay to be hidden
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('hidden')) {
                    initializeDashboard();
                    observer.disconnect();
                }
            });
        });

        observer.observe(loadingOverlay, { attributes: true, attributeFilter: ['class'] });
    } else {
        // If no loading overlay or already hidden, initialize directly
        initializeDashboard();
    }
});

function showMetricsShimmer(container) {
    // We won't save and restore the original content as it's causing issues
    // Instead, we'll clear the container and add shimmer effects
    container.innerHTML = '';

    // Create shimmer for each metric card
    for (let i = 0; i < 4; i++) {
        const shimmerCard = document.createElement('div');
        shimmerCard.className = 'metric-card';
        shimmerCard.innerHTML = `
            <div class="shimmer shimmer-avatar" style="width: 50px; height: 50px;"></div>
            <div class="metric-content">
                <div class="shimmer shimmer-line" style="width: 80px; height: 14px; margin-bottom: 8px;"></div>
                <div class="shimmer shimmer-line" style="width: 40px; height: 24px;"></div>
            </div>
        `;
        container.appendChild(shimmerCard);
    }

    // After delay, replace with actual metric cards
    setTimeout(() => {
        // Clear the shimmer effects
        container.innerHTML = '';

        // Create the actual metric cards
        const metricTitles = ['Active Projects', 'Completed Tasks', 'Team Members', 'Avg. Completion'];
        const metricIds = ['active-projects-count', 'completed-tasks-count', 'team-members-count', 'avg-completion'];
        const metricIcons = ['fa-tasks', 'fa-check-circle', 'fa-user-clock', 'fa-hourglass-half'];

        for (let i = 0; i < 4; i++) {
            const metricCard = document.createElement('div');
            metricCard.className = 'metric-card';
            metricCard.innerHTML = `
                <div class="metric-icon">
                    <i class="fas ${metricIcons[i]}"></i>
                </div>
                <div class="metric-content">
                    <h3>${metricTitles[i]}</h3>
                    <p class="metric-value" id="${metricIds[i]}">0${i === 3 ? '%' : ''}</p>
                </div>
            `;
            container.appendChild(metricCard);
        }

        // Initialize the actual metrics
        updateDashboardMetrics();
    }, 800);
}

function initializeDashboardMetrics() {
    // This function now just triggers the shimmer effect
    // The actual metrics update happens in updateDashboardMetrics
}

async function updateDashboardMetrics() {
    try {
        // Fetch real data from the API
        const projects = await fetchProjects();
        const tasks = await fetchTasks();
        const teamMembers = await fetchTeamMembers();

        // Update active projects count with animation
        const activeProjects = projects.filter(project => project.status !== 'completed');
        animateCounter('active-projects-count', 0, activeProjects.length);

        // Update completed tasks count with animation
        const completedTasks = tasks.filter(task => task.status === 'completed');
        animateCounter('completed-tasks-count', 0, completedTasks.length);

        // Update team members count with animation
        animateCounter('team-members-count', 0, teamMembers.length);

        // Update average completion percentage with animation
        let avgCompletion = 0;
        if (projects.length > 0) {
            const totalProgress = projects.reduce((sum, project) => sum + project.progress, 0);
            avgCompletion = Math.round(totalProgress / projects.length);
        }
        animateCounter('avg-completion', 0, avgCompletion, '%');
    } catch (error) {
        console.error('Error updating dashboard metrics:', error);
        showNotification('Failed to load dashboard metrics', 'error');
    }
}

function animateCounter(elementId, start, end, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1000; // 1 second
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    const increment = (end - start) / totalFrames;

    let currentFrame = 0;
    let currentValue = start;

    const animate = () => {
        currentFrame++;
        currentValue += increment;

        if (currentFrame === totalFrames) {
            element.textContent = end + suffix;
        } else {
            element.textContent = Math.floor(currentValue) + suffix;
            requestAnimationFrame(animate);
        }
    };

    animate();
}

function loadProjectCards() {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = ''; // Clear loading message

    // Add shimmer loading effect
    showProjectsShimmer(projectsGrid);

    // Simulate loading delay
    setTimeout(() => {
        projectsGrid.innerHTML = ''; // Clear shimmer
        renderProjectCards();
    }, 800);
}

function showProjectsShimmer(container) {
    // Create shimmer cards for projects
    for (let i = 0; i < 4; i++) {
        const shimmerCard = document.createElement('div');
        shimmerCard.className = 'shimmer-card';
        shimmerCard.innerHTML = `
            <div class="shimmer shimmer-line" style="height: 24px; margin-bottom: 15px;"></div>
            <div class="shimmer shimmer-line" style="height: 16px; margin-bottom: 20px;"></div>
            <div class="shimmer shimmer-line short" style="height: 14px; margin-bottom: 10px;"></div>
            <div class="shimmer" style="height: 6px; margin-top: 15px;"></div>
        `;
        container.appendChild(shimmerCard);
    }
}

async function renderProjectCards() {
    const projectsGrid = document.getElementById('projects-grid');

    try {
        // Fetch real projects data from API
        const projects = await fetchProjects();

        // Get active projects and sort by priority
        const activeProjects = projects
            .filter(project => project.status !== 'completed')
            .sort((a, b) => {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
            });

        // Display up to 4 projects
        const projectsToShow = activeProjects.slice(0, 4);

        if (projectsToShow.length === 0) {
            // No projects to show
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <i class="fas fa-project-diagram"></i>
                <h4>No Active Projects</h4>
                <p>Create a new project to get started.</p>
            `;
            projectsGrid.appendChild(emptyMessage);
            return;
        }

        projectsToShow.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.style.opacity = '0';
            projectCard.style.transform = 'translateY(20px)';

            // Handle missing description
            const description = project.description || `Project created by ${project.createdBy?.name || 'Admin'}`;

            projectCard.innerHTML = `
                <h4>${project.name}</h4>
                <p>${description.substring(0, 60)}${description.length > 60 ? '...' : ''}</p>
                <div class="project-meta">
                    <span class="project-status status-${project.status || 'not-started'}">${getStatusLabel(project.status || 'not-started')}</span>
                    <span>${formatDate(project.startDate)} - ${formatDate(project.endDate)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" data-progress="${project.progress || 0}" style="width: 0%"></div>
                </div>
            `;

            projectsGrid.appendChild(projectCard);

            // Staggered animation
            setTimeout(() => {
                projectCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                projectCard.style.opacity = '1';
                projectCard.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });

        // Animate progress bars after cards are visible
        setTimeout(() => {
            animateProgressBars();
        }, 600);
    } catch (error) {
        console.error('Error rendering project cards:', error);
        projectsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error Loading Projects</h4>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function initializeProgressChart() {
    const chartContainer = document.querySelector('.chart-container');

    // Show shimmer loading effect
    chartContainer.innerHTML = '<div class="shimmer" style="height: 300px;"></div>';

    // Simulate loading delay
    setTimeout(() => {
        // Restore canvas
        chartContainer.innerHTML = '<canvas id="progress-chart"></canvas>';
        const ctx = document.getElementById('progress-chart').getContext('2d');
        renderProgressChart(ctx);
    }, 1200);
}

async function renderProgressChart(ctx) {
    try {
        // Fetch real projects data from API
        const projects = await fetchProjects();

        // Get active projects
        const activeProjects = projects
            .filter(project => project.status !== 'completed')
            .sort((a, b) => b.progress - a.progress) // Sort by progress (highest first)
            .slice(0, 3); // Top 3 active projects

        // For very small screens, only show 1 project
        const isVerySmallScreen = window.innerWidth <= 480;
        const projectsToShow = isVerySmallScreen ? activeProjects.slice(0, 1) : activeProjects;

        const labels = projectsToShow.map(project => project.name);
        const completedData = projectsToShow.map(project => project.progress || 0);
        const remainingData = projectsToShow.map(project => 100 - (project.progress || 0));

    // Add gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(13, 138, 188, 0.8)');
    gradient.addColorStop(1, 'rgba(13, 138, 188, 0.2)');

    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;

    // Clear the canvas first to prevent rendering issues
    ctx.canvas.width = ctx.canvas.offsetWidth;
    ctx.canvas.height = ctx.canvas.offsetHeight;

    // For very small screens, use a simple text display instead of a chart
    if (isVerySmallScreen && projectsToShow.length > 0) {
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw text showing project progress
        ctx.font = '14px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';

        const project = projectsToShow[0];
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2 - 20;

        ctx.fillText(`${project.name}`, centerX, centerY);
        ctx.fillText(`Progress: ${project.progress}%`, centerX, centerY + 30);

        // Draw a simple progress bar
        const barWidth = ctx.canvas.width * 0.8;
        const barHeight = 20;
        const barX = (ctx.canvas.width - barWidth) / 2;
        const barY = centerY + 50;

        // Background
        ctx.fillStyle = 'rgba(229, 229, 234, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress
        ctx.fillStyle = 'rgba(13, 138, 188, 0.8)';
        ctx.fillRect(barX, barY, barWidth * (project.progress / 100), barHeight);

        // Add a note to view more projects
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('View more in landscape mode', centerX, barY + 40);

        // Add a resize listener
        window.addEventListener('resize', function() {
            const newIsVerySmallScreen = window.innerWidth <= 480;
            if (newIsVerySmallScreen !== isVerySmallScreen) {
                renderProgressChart(ctx);
            }
        });

        return; // Exit early, no need to create a Chart instance
    }

    const progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Completed',
                    data: completedData,
                    backgroundColor: gradient,
                    borderColor: '#0D8ABC',
                    borderWidth: isMobile ? 1 : 2
                },
                {
                    label: 'Remaining',
                    data: remainingData,
                    backgroundColor: 'rgba(229, 229, 234, 0.5)',
                    borderColor: '#E5E5EA',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            },
            indexAxis: isVerySmallScreen ? 'y' : 'x',
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        // Shorten labels on mobile
                        callback: function(value, index) {
                            const label = labels[index];
                            if (isMobile) {
                                if (label.length > 8) {
                                    return label.substring(0, 8) + '...';
                                }
                            }
                            return label;
                        },
                        font: {
                            size: isMobile ? 9 : 12
                        },
                        maxRotation: 0,
                        minRotation: 0
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            size: isMobile ? 9 : 12
                        },
                        // Show fewer ticks on mobile
                        stepSize: isMobile ? 25 : 20
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: isMobile ? 10 : 12
                        },
                        boxWidth: isMobile ? 8 : 15,
                        padding: isMobile ? 5 : 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '%';
                        }
                    },
                    displayColors: false,
                    bodyFont: {
                        size: isMobile ? 10 : 12
                    }
                }
            },
            layout: {
                padding: {
                    left: 5,
                    right: 5,
                    top: 0,
                    bottom: 5
                }
            }
        }
    });

    // Handle window resize to update chart for mobile/desktop
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth <= 768;
        const newIsVerySmallScreen = window.innerWidth <= 480;
        if (newIsMobile !== isMobile || newIsVerySmallScreen !== isVerySmallScreen) {
            // Destroy and recreate chart if mobile state changed
            if (progressChart) {
                progressChart.destroy();
            }
            renderProgressChart(ctx);
        }
    });
    } catch (error) {
        console.error('Error rendering progress chart:', error);
        // Display a simple error message in the chart container
        if (ctx && ctx.canvas) {
            const container = ctx.canvas.parentElement;
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Error Loading Chart</h4>
                        <p>Please try again later.</p>
                    </div>
                `;
            }
        }
    }
}

function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = ''; // Clear loading message

    // Add shimmer loading effect
    showActivityShimmer(activityList);

    // Simulate a short loading delay for better UX
    setTimeout(() => {
        activityList.innerHTML = ''; // Clear shimmer
        renderActivityItems();
    }, 1000);
}

function showActivityShimmer(container) {
    // Create shimmer items for activities
    for (let i = 0; i < 5; i++) {
        const shimmerItem = document.createElement('div');
        shimmerItem.className = 'activity-item';
        shimmerItem.innerHTML = `
            <div class="shimmer shimmer-avatar"></div>
            <div class="shimmer-container" style="flex: 1;">
                <div class="shimmer shimmer-line" style="height: 16px;"></div>
                <div class="shimmer shimmer-line short" style="height: 12px;"></div>
            </div>
        `;
        container.appendChild(shimmerItem);
    }
}

async function renderActivityItems() {
    const activityList = document.getElementById('activity-list');

    try {
        // Fetch real activities data from API
        const activities = await fetchRecentActivities();

        // Get 5 most recent activities
        const recentActivities = activities.slice(0, 5);

        if (recentActivities.length === 0) {
            // No activities to show
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <i class="fas fa-history"></i>
                <h4>No Recent Activity</h4>
                <p>Activity will appear here as you work on projects and tasks.</p>
            `;
            activityList.appendChild(emptyMessage);
            return;
        }

        recentActivities.forEach((activity, index) => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';

            let activityText = '';
            let iconClass = '';

            switch (activity.type) {
                case 'task_completed':
                    activityText = `<strong>${activity.userName}</strong> completed task <strong>${activity.taskName}</strong> in <strong>${activity.projectName}</strong>`;
                    iconClass = 'fa-check-circle';
                    break;
                case 'task_started':
                    activityText = `<strong>${activity.userName}</strong> started working on <strong>${activity.taskName}</strong> in <strong>${activity.projectName}</strong>`;
                    iconClass = 'fa-play-circle';
                    break;
                case 'project_created':
                    activityText = `<strong>${activity.userName}</strong> created a new project <strong>${activity.projectName}</strong>`;
                    iconClass = 'fa-plus-circle';
                    break;
                case 'project_completed':
                    activityText = `<strong>${activity.userName}</strong> marked project <strong>${activity.projectName}</strong> as completed`;
                    iconClass = 'fa-flag-checkered';
                    break;
                default:
                    activityText = `<strong>${activity.userName}</strong> performed an action on <strong>${activity.projectName}</strong>`;
                    iconClass = 'fa-info-circle';
            }

            const timestamp = new Date(activity.timestamp);
            const timeAgo = getTimeAgo(timestamp);

            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="activity-content">
                    <p>${activityText}</p>
                    <span class="time">${timeAgo}</span>
                </div>
            `;

            // Add a staggered entrance animation
            activityItem.style.opacity = '0';
            activityItem.style.transform = 'translateX(20px)';

            activityList.appendChild(activityItem);

            // Trigger the animation with a staggered delay
            setTimeout(() => {
                activityItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                activityItem.style.opacity = '1';
                activityItem.style.transform = 'translateX(0)';
            }, index * 100);
        });
    } catch (error) {
        console.error('Error rendering activity items:', error);
        activityList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error Loading Activities</h4>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}
