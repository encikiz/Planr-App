// Milestone Timeline Visualization

// Initialize the timeline visualization
async function initMilestoneTimeline() {
    try {
        // Get the container element
        const timelineContainer = document.getElementById('milestone-timeline-container');
        if (!timelineContainer) return;
        
        // Show loading state
        timelineContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch all milestones
        const milestones = await fetchAllMilestones();
        
        // If no milestones, show empty state
        if (milestones.length === 0) {
            timelineContainer.innerHTML = `
                <div class="empty-timeline">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>No Milestones Found</h3>
                    <p>Create milestones to visualize your project timeline</p>
                </div>
            `;
            return;
        }
        
        // Group milestones by project
        const projectMilestones = groupMilestonesByProject(milestones);
        
        // Render the timeline
        renderMilestoneTimeline(timelineContainer, projectMilestones);
    } catch (error) {
        console.error('Error initializing milestone timeline:', error);
        const timelineContainer = document.getElementById('milestone-timeline-container');
        if (timelineContainer) {
            timelineContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Timeline</h3>
                    <p>${error.message || 'Failed to load milestone timeline'}</p>
                </div>
            `;
        }
    }
}

// Fetch all milestones
async function fetchAllMilestones() {
    try {
        const response = await fetch('/api/milestones');
        if (!response.ok) {
            throw new Error('Failed to fetch milestones');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching milestones:', error);
        throw error;
    }
}

// Group milestones by project
function groupMilestonesByProject(milestones) {
    const projectMilestones = {};
    
    milestones.forEach(milestone => {
        const projectId = milestone.projectId._id;
        const projectName = milestone.projectId.name;
        
        if (!projectMilestones[projectId]) {
            projectMilestones[projectId] = {
                id: projectId,
                name: projectName,
                milestones: []
            };
        }
        
        projectMilestones[projectId].milestones.push(milestone);
    });
    
    // Sort milestones by due date within each project
    for (const projectId in projectMilestones) {
        projectMilestones[projectId].milestones.sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }
    
    return projectMilestones;
}

// Render the milestone timeline
function renderMilestoneTimeline(container, projectMilestones) {
    // Clear the container
    container.innerHTML = '';
    
    // Create the timeline container
    const timelineEl = document.createElement('div');
    timelineEl.className = 'milestone-timeline';
    
    // Calculate the date range for all milestones
    const dateRange = calculateDateRange(projectMilestones);
    
    // Create the timeline header with months
    const timelineHeader = createTimelineHeader(dateRange);
    timelineEl.appendChild(timelineHeader);
    
    // Create a timeline row for each project
    for (const projectId in projectMilestones) {
        const project = projectMilestones[projectId];
        const projectRow = createProjectRow(project, dateRange);
        timelineEl.appendChild(projectRow);
    }
    
    // Add the timeline to the container
    container.appendChild(timelineEl);
}

// Calculate the date range for all milestones
function calculateDateRange(projectMilestones) {
    let minDate = new Date();
    let maxDate = new Date();
    let hasData = false;
    
    // Find the earliest and latest dates
    for (const projectId in projectMilestones) {
        const milestones = projectMilestones[projectId].milestones;
        
        milestones.forEach(milestone => {
            const dueDate = new Date(milestone.dueDate);
            
            if (!hasData) {
                minDate = dueDate;
                maxDate = dueDate;
                hasData = true;
            } else {
                if (dueDate < minDate) minDate = dueDate;
                if (dueDate > maxDate) maxDate = dueDate;
            }
        });
    }
    
    // Add padding to the date range (1 month before and after)
    minDate.setMonth(minDate.getMonth() - 1);
    minDate.setDate(1); // Start at the beginning of the month
    
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(0); // End at the end of the month
    
    return { minDate, maxDate };
}

// Create the timeline header with months
function createTimelineHeader(dateRange) {
    const headerEl = document.createElement('div');
    headerEl.className = 'timeline-header';
    
    // Create the project label column
    const projectLabelEl = document.createElement('div');
    projectLabelEl.className = 'timeline-project-label';
    projectLabelEl.textContent = 'Projects';
    headerEl.appendChild(projectLabelEl);
    
    // Create the months container
    const monthsContainerEl = document.createElement('div');
    monthsContainerEl.className = 'timeline-months';
    
    // Generate months between min and max dates
    const months = generateMonthsBetweenDates(dateRange.minDate, dateRange.maxDate);
    
    // Create a column for each month
    months.forEach(month => {
        const monthEl = document.createElement('div');
        monthEl.className = 'timeline-month';
        monthEl.textContent = month.label;
        monthEl.style.width = `${month.days * 20}px`; // 20px per day
        monthsContainerEl.appendChild(monthEl);
    });
    
    headerEl.appendChild(monthsContainerEl);
    return headerEl;
}

// Generate months between two dates
function generateMonthsBetweenDates(startDate, endDate) {
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        // Calculate days in this month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        months.push({
            year,
            month,
            label: monthLabel,
            days: daysInMonth
        });
        
        // Move to the next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
}

// Create a timeline row for a project
function createProjectRow(project, dateRange) {
    const rowEl = document.createElement('div');
    rowEl.className = 'timeline-row';
    
    // Create the project label
    const projectLabelEl = document.createElement('div');
    projectLabelEl.className = 'timeline-project-label';
    projectLabelEl.textContent = project.name;
    rowEl.appendChild(projectLabelEl);
    
    // Create the milestones container
    const milestonesContainerEl = document.createElement('div');
    milestonesContainerEl.className = 'timeline-milestones';
    
    // Calculate the total number of days in the timeline
    const totalDays = Math.ceil((dateRange.maxDate - dateRange.minDate) / (1000 * 60 * 60 * 24));
    milestonesContainerEl.style.width = `${totalDays * 20}px`; // 20px per day
    
    // Add milestones to the container
    project.milestones.forEach(milestone => {
        const milestoneEl = createMilestoneElement(milestone, dateRange);
        milestonesContainerEl.appendChild(milestoneEl);
    });
    
    rowEl.appendChild(milestonesContainerEl);
    return rowEl;
}

// Create a milestone element
function createMilestoneElement(milestone, dateRange) {
    const milestoneEl = document.createElement('div');
    milestoneEl.className = `timeline-milestone milestone-${milestone.status}`;
    milestoneEl.dataset.id = milestone._id;
    
    // Calculate position and width
    const dueDate = new Date(milestone.dueDate);
    const daysSinceStart = Math.ceil((dueDate - dateRange.minDate) / (1000 * 60 * 60 * 24));
    
    // Position the milestone
    milestoneEl.style.left = `${daysSinceStart * 20}px`; // 20px per day
    
    // Create the milestone content
    milestoneEl.innerHTML = `
        <div class="milestone-dot"></div>
        <div class="milestone-label">${milestone.name}</div>
    `;
    
    // Add click event to navigate to milestone details
    milestoneEl.addEventListener('click', () => {
        window.location.href = `milestone-details.html?id=${milestone._id}`;
    });
    
    return milestoneEl;
}

// Initialize the Gantt chart visualization
async function initMilestoneGantt() {
    try {
        // Get the container element
        const ganttContainer = document.getElementById('milestone-gantt-container');
        if (!ganttContainer) return;
        
        // Show loading state
        ganttContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch all milestones
        const milestones = await fetchAllMilestones();
        
        // If no milestones, show empty state
        if (milestones.length === 0) {
            ganttContainer.innerHTML = `
                <div class="empty-gantt">
                    <i class="fas fa-tasks"></i>
                    <h3>No Milestones Found</h3>
                    <p>Create milestones to visualize your project timeline</p>
                </div>
            `;
            return;
        }
        
        // Group milestones by project
        const projectMilestones = groupMilestonesByProject(milestones);
        
        // Render the Gantt chart
        renderMilestoneGantt(ganttContainer, projectMilestones);
    } catch (error) {
        console.error('Error initializing milestone Gantt chart:', error);
        const ganttContainer = document.getElementById('milestone-gantt-container');
        if (ganttContainer) {
            ganttContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Gantt Chart</h3>
                    <p>${error.message || 'Failed to load milestone Gantt chart'}</p>
                </div>
            `;
        }
    }
}

// Render the milestone Gantt chart
function renderMilestoneGantt(container, projectMilestones) {
    // Clear the container
    container.innerHTML = '';
    
    // Create the Gantt container
    const ganttEl = document.createElement('div');
    ganttEl.className = 'milestone-gantt';
    
    // Calculate the date range for all milestones
    const dateRange = calculateDateRange(projectMilestones);
    
    // Create the Gantt header with dates
    const ganttHeader = createGanttHeader(dateRange);
    ganttEl.appendChild(ganttHeader);
    
    // Create a Gantt row for each project
    for (const projectId in projectMilestones) {
        const project = projectMilestones[projectId];
        const projectRow = createGanttProjectRow(project, dateRange);
        ganttEl.appendChild(projectRow);
    }
    
    // Add the Gantt chart to the container
    container.appendChild(ganttEl);
}

// Create the Gantt header with dates
function createGanttHeader(dateRange) {
    const headerEl = document.createElement('div');
    headerEl.className = 'gantt-header';
    
    // Create the project label column
    const projectLabelEl = document.createElement('div');
    projectLabelEl.className = 'gantt-project-label';
    projectLabelEl.textContent = 'Projects';
    headerEl.appendChild(projectLabelEl);
    
    // Create the dates container
    const datesContainerEl = document.createElement('div');
    datesContainerEl.className = 'gantt-dates';
    
    // Calculate the total number of days in the timeline
    const totalDays = Math.ceil((dateRange.maxDate - dateRange.minDate) / (1000 * 60 * 60 * 24));
    
    // Create a column for each week
    const weeks = Math.ceil(totalDays / 7);
    for (let i = 0; i < weeks; i++) {
        const weekStartDate = new Date(dateRange.minDate);
        weekStartDate.setDate(weekStartDate.getDate() + (i * 7));
        
        const weekEl = document.createElement('div');
        weekEl.className = 'gantt-week';
        weekEl.textContent = weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        datesContainerEl.appendChild(weekEl);
    }
    
    headerEl.appendChild(datesContainerEl);
    return headerEl;
}

// Create a Gantt row for a project
function createGanttProjectRow(project, dateRange) {
    const rowEl = document.createElement('div');
    rowEl.className = 'gantt-row';
    
    // Create the project label
    const projectLabelEl = document.createElement('div');
    projectLabelEl.className = 'gantt-project-label';
    projectLabelEl.textContent = project.name;
    rowEl.appendChild(projectLabelEl);
    
    // Create the milestones container
    const milestonesContainerEl = document.createElement('div');
    milestonesContainerEl.className = 'gantt-milestones';
    
    // Calculate the total number of days in the timeline
    const totalDays = Math.ceil((dateRange.maxDate - dateRange.minDate) / (1000 * 60 * 60 * 24));
    
    // Create a grid for the Gantt chart
    const gridEl = document.createElement('div');
    gridEl.className = 'gantt-grid';
    
    // Create grid lines for each week
    const weeks = Math.ceil(totalDays / 7);
    for (let i = 0; i < weeks; i++) {
        const gridLineEl = document.createElement('div');
        gridLineEl.className = 'gantt-grid-line';
        gridEl.appendChild(gridLineEl);
    }
    
    milestonesContainerEl.appendChild(gridEl);
    
    // Add milestones to the container
    project.milestones.forEach(milestone => {
        const milestoneEl = createGanttMilestoneElement(milestone, dateRange);
        milestonesContainerEl.appendChild(milestoneEl);
    });
    
    rowEl.appendChild(milestonesContainerEl);
    return rowEl;
}

// Create a Gantt milestone element
function createGanttMilestoneElement(milestone, dateRange) {
    const milestoneEl = document.createElement('div');
    milestoneEl.className = `gantt-milestone milestone-${milestone.status}`;
    milestoneEl.dataset.id = milestone._id;
    
    // Calculate position and width
    const dueDate = new Date(milestone.dueDate);
    const daysSinceStart = Math.ceil((dueDate - dateRange.minDate) / (1000 * 60 * 60 * 24));
    
    // Position the milestone (each week is 100px wide)
    const weekPosition = Math.floor(daysSinceStart / 7);
    const dayPosition = daysSinceStart % 7;
    milestoneEl.style.left = `${weekPosition * 100 + dayPosition * (100 / 7)}px`;
    
    // Create the milestone content
    milestoneEl.innerHTML = `
        <div class="milestone-bar">
            <div class="milestone-progress" style="width: ${milestone.progress}%"></div>
        </div>
        <div class="milestone-label">${milestone.name}</div>
    `;
    
    // Add click event to navigate to milestone details
    milestoneEl.addEventListener('click', () => {
        window.location.href = `milestone-details.html?id=${milestone._id}`;
    });
    
    return milestoneEl;
}

// Export functions
window.initMilestoneTimeline = initMilestoneTimeline;
window.initMilestoneGantt = initMilestoneGantt;
