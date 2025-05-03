// Charts and visualizations functionality
document.addEventListener('DOMContentLoaded', function() {
    // This file contains additional chart functionality that can be used across the application
    console.log('Charts module loaded');
});

// Function to create a custom progress donut chart using Canvas API
function createDonutChart(canvasId, percentage, color = '#0D8ABC', size = 100) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const lineWidth = size * 0.1;
    
    // Set canvas size
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#E5E5EA';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Draw progress arc
    const startAngle = -Math.PI / 2; // Start from top
    const endAngle = startAngle + (Math.PI * 2 * percentage / 100);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Draw percentage text
    ctx.font = `${size * 0.2}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = '#1D1D1F';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(percentage)}%`, centerX, centerY);
}

// Function to create a line chart for project progress over time
function createProgressLineChart(canvasId, progressData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const labels = progressData.map(item => item.week);
    const completedData = progressData.map(item => item.completed);
    const plannedData = progressData.map(item => item.planned);
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Completed',
                    data: completedData,
                    borderColor: '#0D8ABC',
                    backgroundColor: 'rgba(13, 138, 188, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Planned',
                    data: plannedData,
                    borderColor: '#86868B',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Progress (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '%';
                        }
                    }
                }
            }
        }
    });
}

// Function to create a radar chart for team skills
function createSkillsRadarChart(canvasId, skills) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const labels = skills.map(skill => skill.name);
    const data = skills.map(skill => skill.level);
    
    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Skill Level',
                data: data,
                backgroundColor: 'rgba(13, 138, 188, 0.2)',
                borderColor: '#0D8ABC',
                pointBackgroundColor: '#0D8ABC',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0D8ABC'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Function to create a Gantt chart using Canvas
function createGanttChart(canvasId, tasks, startDate, endDate) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Calculate dimensions
    const headerHeight = 40;
    const rowHeight = 30;
    const leftPadding = 150;
    const dayWidth = (width - leftPadding) / totalDays;
    
    // Draw header
    ctx.fillStyle = '#F5F5F7';
    ctx.fillRect(0, 0, width, headerHeight);
    
    // Draw header text
    ctx.fillStyle = '#1D1D1F';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Task', 10, headerHeight / 2);
    
    // Draw date headers
    const dateIncrement = Math.ceil(totalDays / 10); // Show approximately 10 date labels
    for (let i = 0; i <= totalDays; i += dateIncrement) {
        const x = leftPadding + (i * dayWidth);
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        
        // Draw date text
        ctx.fillStyle = '#6E6E73';
        ctx.textAlign = 'center';
        ctx.fillText(formatDate(date), x, headerHeight / 2);
        
        // Draw vertical grid line
        ctx.strokeStyle = '#E5E5EA';
        ctx.beginPath();
        ctx.moveTo(x, headerHeight);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Draw tasks
    tasks.forEach((task, index) => {
        const y = headerHeight + (index * rowHeight);
        
        // Draw task name
        ctx.fillStyle = '#1D1D1F';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(task.name, 10, y + rowHeight / 2);
        
        // Calculate task position
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.dueDate);
        const taskStartDays = Math.ceil((taskStart - start) / (1000 * 60 * 60 * 24));
        const taskDuration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24));
        
        const taskX = leftPadding + (taskStartDays * dayWidth);
        const taskWidth = taskDuration * dayWidth;
        
        // Draw task bar
        let barColor;
        switch (task.status) {
            case 'completed':
                barColor = '#34C759';
                break;
            case 'in-progress':
                barColor = '#0D8ABC';
                break;
            case 'not-started':
                barColor = '#86868B';
                break;
            default:
                barColor = '#0D8ABC';
        }
        
        ctx.fillStyle = barColor;
        ctx.fillRect(taskX, y + 5, taskWidth, rowHeight - 10);
        
        // Draw progress indicator
        if (task.progress > 0 && task.progress < 100) {
            ctx.fillStyle = '#34C759';
            ctx.fillRect(taskX, y + 5, taskWidth * (task.progress / 100), rowHeight - 10);
        }
        
        // Draw task text
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (taskWidth > 50) { // Only draw text if there's enough space
            ctx.fillText(`${task.progress}%`, taskX + taskWidth / 2, y + rowHeight / 2);
        }
    });
}
