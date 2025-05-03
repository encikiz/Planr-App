// Milestone Reports Functionality

// Initialize the milestone reports page
async function initMilestoneReports() {
    try {
        // Load filter options
        await loadFilterOptions();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load initial data
        await loadReportData();
    } catch (error) {
        console.error('Error initializing milestone reports:', error);
        showNotification('Failed to initialize reports', 'error');
    }
}

// Load filter options
async function loadFilterOptions() {
    try {
        // Fetch projects for filter
        const projects = await fetchAllProjects();
        
        // Populate project filter dropdown
        const projectFilter = document.getElementById('project-filter');
        if (projectFilter) {
            // Clear existing options except the first one
            while (projectFilter.options.length > 1) {
                projectFilter.remove(1);
            }
            
            // Add project options
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project._id;
                option.textContent = project.name;
                projectFilter.appendChild(option);
            });
        }
        
        // Set default dates for custom date range
        const today = new Date();
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        
        if (startDate) {
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate.value = formatDateForInput(firstDayOfMonth);
        }
        
        if (endDate) {
            endDate.value = formatDateForInput(today);
        }
    } catch (error) {
        console.error('Error loading filter options:', error);
        showNotification('Failed to load filter options', 'error');
    }
}

// Format date for input fields (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Set up event listeners
function setupEventListeners() {
    // Date range filter change
    const dateRangeFilter = document.getElementById('date-range-filter');
    if (dateRangeFilter) {
        dateRangeFilter.addEventListener('change', function() {
            const customDateRange = document.getElementById('custom-date-range');
            if (this.value === 'custom') {
                customDateRange.classList.remove('hidden');
            } else {
                customDateRange.classList.add('hidden');
            }
        });
    }
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', loadReportData);
    }
    
    // Export buttons
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportReportToPdf);
    }
    
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportReportToCsv);
    }
}

// Load report data based on filters
async function loadReportData() {
    try {
        // Show loading state
        showLoadingState();
        
        // Get filter values
        const projectId = document.getElementById('project-filter').value;
        const dateRange = document.getElementById('date-range-filter').value;
        
        // Calculate date range
        const { startDate, endDate } = calculateDateRange(dateRange);
        
        // Fetch milestones based on filters
        const milestones = await fetchFilteredMilestones(projectId, startDate, endDate);
        
        // Generate reports
        generateStatusDistributionChart(milestones);
        generateCompletionTrendChart(milestones);
        generateProjectProgressChart(milestones);
        generateBurndownChart(milestones);
        
        // Populate milestone table
        populateMilestoneTable(milestones);
    } catch (error) {
        console.error('Error loading report data:', error);
        showNotification('Failed to load report data', 'error');
    }
}

// Show loading state for charts and table
function showLoadingState() {
    // Clear existing charts
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        const canvas = container.querySelector('canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
    
    // Show loading state for table
    const tableBody = document.getElementById('milestone-table-body');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="6">
                    <div class="loading-spinner-small"></div>
                    <span>Loading milestone data...</span>
                </td>
            </tr>
        `;
    }
}

// Calculate date range based on filter
function calculateDateRange(dateRangeFilter) {
    const today = new Date();
    let startDate, endDate;
    
    switch (dateRangeFilter) {
        case 'this-month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
            
        case 'last-month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
            
        case 'this-quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1);
            endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
            break;
            
        case 'last-quarter':
            const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
            const year = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
            const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
            startDate = new Date(year, adjustedQuarter * 3, 1);
            endDate = new Date(year, (adjustedQuarter + 1) * 3, 0);
            break;
            
        case 'this-year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
            
        case 'custom':
            const startDateInput = document.getElementById('start-date');
            const endDateInput = document.getElementById('end-date');
            
            if (startDateInput && startDateInput.value) {
                startDate = new Date(startDateInput.value);
            } else {
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            }
            
            if (endDateInput && endDateInput.value) {
                endDate = new Date(endDateInput.value);
            } else {
                endDate = today;
            }
            break;
            
        default: // 'all'
            startDate = null;
            endDate = null;
    }
    
    return { startDate, endDate };
}

// Fetch milestones based on filters
async function fetchFilteredMilestones(projectId, startDate, endDate) {
    try {
        // Build query parameters
        let url = '/api/milestones';
        const params = [];
        
        if (projectId && projectId !== 'all') {
            params.push(`projectId=${projectId}`);
        }
        
        if (startDate) {
            params.push(`startDate=${startDate.toISOString()}`);
        }
        
        if (endDate) {
            params.push(`endDate=${endDate.toISOString()}`);
        }
        
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }
        
        // Fetch milestones
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch milestones');
        }
        
        const milestones = await response.json();
        
        // Filter by date if needed (backend might not support date filtering)
        if (startDate || endDate) {
            return milestones.filter(milestone => {
                const dueDate = new Date(milestone.dueDate);
                
                if (startDate && dueDate < startDate) {
                    return false;
                }
                
                if (endDate && dueDate > endDate) {
                    return false;
                }
                
                return true;
            });
        }
        
        return milestones;
    } catch (error) {
        console.error('Error fetching filtered milestones:', error);
        throw error;
    }
}

// Generate status distribution chart
function generateStatusDistributionChart(milestones) {
    const canvas = document.getElementById('status-chart');
    if (!canvas) return;
    
    // Count milestones by status
    const statusCounts = {
        'completed': 0,
        'in-progress': 0,
        'not-started': 0
    };
    
    milestones.forEach(milestone => {
        if (statusCounts.hasOwnProperty(milestone.status)) {
            statusCounts[milestone.status]++;
        } else {
            statusCounts['not-started']++;
        }
    });
    
    // Get theme colors
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const successColor = getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim();
    const textTertiary = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim();
    
    // Create chart
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.statusChart) {
        window.statusChart.destroy();
    }
    
    window.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [
                    statusCounts['completed'],
                    statusCounts['in-progress'],
                    statusCounts['not-started']
                ],
                backgroundColor: [
                    successColor,
                    primaryColor,
                    textTertiary
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Generate completion trend chart
function generateCompletionTrendChart(milestones) {
    const canvas = document.getElementById('completion-trend-chart');
    if (!canvas) return;
    
    // Sort milestones by due date
    const sortedMilestones = [...milestones].sort((a, b) => {
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    // Group milestones by month
    const monthlyData = {};
    
    sortedMilestones.forEach(milestone => {
        const dueDate = new Date(milestone.dueDate);
        const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                total: 0,
                completed: 0,
                label: dueDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            };
        }
        
        monthlyData[monthKey].total++;
        
        if (milestone.status === 'completed') {
            monthlyData[monthKey].completed++;
        }
    });
    
    // Prepare chart data
    const labels = [];
    const totalData = [];
    const completedData = [];
    
    Object.keys(monthlyData).sort().forEach(key => {
        labels.push(monthlyData[key].label);
        totalData.push(monthlyData[key].total);
        completedData.push(monthlyData[key].completed);
    });
    
    // Get theme colors
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const successColor = getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim();
    
    // Create chart
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.completionTrendChart) {
        window.completionTrendChart.destroy();
    }
    
    window.completionTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Milestones',
                    data: totalData,
                    borderColor: primaryColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Completed Milestones',
                    data: completedData,
                    borderColor: successColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Generate project progress chart
function generateProjectProgressChart(milestones) {
    const canvas = document.getElementById('project-progress-chart');
    if (!canvas) return;
    
    // Group milestones by project
    const projectData = {};
    
    milestones.forEach(milestone => {
        const projectId = milestone.projectId._id;
        const projectName = milestone.projectId.name;
        
        if (!projectData[projectId]) {
            projectData[projectId] = {
                name: projectName,
                milestones: [],
                totalProgress: 0,
                count: 0
            };
        }
        
        projectData[projectId].milestones.push(milestone);
        projectData[projectId].totalProgress += milestone.progress || 0;
        projectData[projectId].count++;
    });
    
    // Calculate average progress for each project
    Object.keys(projectData).forEach(projectId => {
        projectData[projectId].averageProgress = Math.round(
            projectData[projectId].totalProgress / projectData[projectId].count
        );
    });
    
    // Sort projects by average progress
    const sortedProjects = Object.values(projectData).sort((a, b) => {
        return b.averageProgress - a.averageProgress;
    });
    
    // Prepare chart data
    const labels = sortedProjects.map(project => project.name);
    const progressData = sortedProjects.map(project => project.averageProgress);
    
    // Get theme colors
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    
    // Create chart
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.projectProgressChart) {
        window.projectProgressChart.destroy();
    }
    
    window.projectProgressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Progress (%)',
                data: progressData,
                backgroundColor: primaryColor,
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Generate burndown chart
function generateBurndownChart(milestones) {
    const canvas = document.getElementById('burndown-chart');
    if (!canvas) return;
    
    // Filter completed and in-progress milestones
    const relevantMilestones = milestones.filter(milestone => {
        return milestone.status === 'completed' || milestone.status === 'in-progress';
    });
    
    // Sort milestones by completion date or due date
    const sortedMilestones = [...relevantMilestones].sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.dueDate);
        const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.dueDate);
        return dateA - dateB;
    });
    
    // Group milestones by week
    const weeklyData = {};
    let remainingCount = sortedMilestones.length;
    
    sortedMilestones.forEach(milestone => {
        const date = milestone.completedAt ? new Date(milestone.completedAt) : new Date(milestone.dueDate);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of the week (Sunday)
        const weekKey = weekStart.toISOString().substring(0, 10);
        
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
                label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                remaining: remainingCount
            };
        }
        
        if (milestone.status === 'completed') {
            remainingCount--;
            weeklyData[weekKey].remaining = remainingCount;
        }
    });
    
    // Prepare chart data
    const labels = [];
    const remainingData = [];
    
    Object.keys(weeklyData).sort().forEach(key => {
        labels.push(weeklyData[key].label);
        remainingData.push(weeklyData[key].remaining);
    });
    
    // Get theme colors
    const dangerColor = getComputedStyle(document.documentElement).getPropertyValue('--danger-color').trim();
    
    // Create chart
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.burndownChart) {
        window.burndownChart.destroy();
    }
    
    window.burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Remaining Milestones',
                data: remainingData,
                borderColor: dangerColor,
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Populate milestone table
function populateMilestoneTable(milestones) {
    const tableBody = document.getElementById('milestone-table-body');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Sort milestones by due date (most recent first)
    const sortedMilestones = [...milestones].sort((a, b) => {
        return new Date(b.dueDate) - new Date(a.dueDate);
    });
    
    // Add rows for each milestone
    if (sortedMilestones.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table-message">No milestones found for the selected filters.</td>
            </tr>
        `;
        return;
    }
    
    sortedMilestones.forEach(milestone => {
        const row = document.createElement('tr');
        
        // Format due date
        const dueDate = new Date(milestone.dueDate);
        const formattedDueDate = dueDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Get status class
        const statusClass = `status-${milestone.status}`;
        
        // Get status label
        const statusLabel = getStatusLabel(milestone.status);
        
        // Get creator name
        const creatorName = milestone.createdBy ? milestone.createdBy.name : 'Unknown';
        
        row.innerHTML = `
            <td>
                <a href="milestone-details.html?id=${milestone._id}" class="milestone-link">
                    ${milestone.name}
                </a>
            </td>
            <td>${milestone.projectId.name}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
            </td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${milestone.progress}%"></div>
                </div>
                <span class="progress-value">${milestone.progress}%</span>
            </td>
            <td>${formattedDueDate}</td>
            <td>${creatorName}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Get status label
function getStatusLabel(status) {
    switch (status) {
        case 'completed':
            return 'Completed';
        case 'in-progress':
            return 'In Progress';
        case 'not-started':
            return 'Not Started';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

// Export report to PDF
function exportReportToPdf() {
    // Show notification
    showNotification('PDF export is not implemented yet', 'info');
    
    // In a real implementation, you would use a library like jsPDF to generate a PDF
    console.log('Export to PDF clicked');
}

// Export report to CSV
function exportReportToCsv() {
    try {
        // Get milestone data from the table
        const tableBody = document.getElementById('milestone-table-body');
        if (!tableBody) {
            throw new Error('Table not found');
        }
        
        // Create CSV content
        let csvContent = 'Milestone,Project,Status,Progress,Due Date,Created By\n';
        
        // Get all rows except the empty message row
        const rows = Array.from(tableBody.querySelectorAll('tr')).filter(row => {
            return !row.querySelector('.empty-table-message');
        });
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 6) {
                // Get milestone name (remove the link)
                const milestoneName = cells[0].textContent.trim();
                
                // Get other cell values
                const projectName = cells[1].textContent.trim();
                const status = cells[2].textContent.trim();
                const progress = cells[3].querySelector('.progress-value').textContent.trim();
                const dueDate = cells[4].textContent.trim();
                const createdBy = cells[5].textContent.trim();
                
                // Add row to CSV
                csvContent += `"${milestoneName}","${projectName}","${status}",${progress},"${dueDate}","${createdBy}"\n`;
            }
        });
        
        // Create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'milestone-report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success notification
        showNotification('Report exported to CSV successfully', 'success');
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showNotification('Failed to export report to CSV', 'error');
    }
}

// Fetch all projects
async function fetchAllProjects() {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

// Export functions
window.initMilestoneReports = initMilestoneReports;
