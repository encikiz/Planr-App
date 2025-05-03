// Member Modal functionality

// Function to open the create member modal
window.openCreateMemberModal = function() {
    console.log('Opening create member modal');
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-user-plus"></i> Add New Team Member</h3>
            <button type="button" class="close-modal-btn" aria-label="Close modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <form id="create-member-form" class="member-creation-form">
                <div class="form-group">
                    <label for="member-name">Name <span class="required">*</span></label>
                    <input type="text" id="member-name" name="name" required placeholder="Enter member name">
                </div>
                
                <div class="form-group">
                    <label for="member-email">Email (optional)</label>
                    <input type="email" id="member-email" name="email" placeholder="Enter member email">
                </div>
                
                <div class="form-group">
                    <label for="member-role">Role (optional)</label>
                    <input type="text" id="member-role" name="role" placeholder="Enter member role">
                </div>
                
                <div class="form-group">
                    <label for="member-department">Department (optional)</label>
                    <select id="member-department" name="department">
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Product">Product</option>
                        <option value="Marketing">Marketing</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Sales">Sales</option>
                        <option value="Customer Support">Customer Support</option>
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="cancel-btn">Cancel</button>
            <button type="button" class="save-btn" id="create-member-btn">Add Member</button>
        </div>
    `;

    // Create and show the modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
        backdrop.classList.add('show');
    }, 10);

    // Set up event listeners
    setupMemberModalEventListeners(modal, backdrop);
};

// Function to open the edit member modal
window.openEditMemberModal = function(memberId) {
    console.log('Opening edit member modal for member:', memberId);
    
    // Fetch member data
    fetchTeamMemberById(memberId).then(member => {
        if (!member) {
            showNotification('Failed to load member details', 'error');
            return;
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Edit Team Member</h3>
                <button type="button" class="close-modal-btn" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="edit-member-form" class="member-creation-form">
                    <div class="form-group">
                        <label for="member-name">Name <span class="required">*</span></label>
                        <input type="text" id="member-name" name="name" required placeholder="Enter member name" value="${member.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="member-email">Email (optional)</label>
                        <input type="email" id="member-email" name="email" placeholder="Enter member email" value="${member.email || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="member-role">Role (optional)</label>
                        <input type="text" id="member-role" name="role" placeholder="Enter member role" value="${member.role || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="member-department">Department (optional)</label>
                        <select id="member-department" name="department">
                            <option value="">Select Department</option>
                            <option value="Engineering" ${member.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                            <option value="Design" ${member.department === 'Design' ? 'selected' : ''}>Design</option>
                            <option value="Product" ${member.department === 'Product' ? 'selected' : ''}>Product</option>
                            <option value="Marketing" ${member.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                            <option value="IT" ${member.department === 'IT' ? 'selected' : ''}>IT</option>
                            <option value="HR" ${member.department === 'HR' ? 'selected' : ''}>HR</option>
                            <option value="Finance" ${member.department === 'Finance' ? 'selected' : ''}>Finance</option>
                            <option value="Sales" ${member.department === 'Sales' ? 'selected' : ''}>Sales</option>
                            <option value="Customer Support" ${member.department === 'Customer Support' ? 'selected' : ''}>Customer Support</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="button" class="save-btn" id="update-member-btn">Update Member</button>
            </div>
        `;

        // Create and show the modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);

        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
            backdrop.classList.add('show');
        }, 10);

        // Set up event listeners
        setupEditMemberModalEventListeners(modal, backdrop, member);
    });
};

// Function to set up event listeners for the member modal
function setupMemberModalEventListeners(modal, backdrop) {
    // Close modal on close button click
    const closeBtn = modal.querySelector('.close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on cancel button click
    const cancelBtn = modal.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on backdrop click
    backdrop.addEventListener('click', () => {
        closeModal(modal, backdrop);
    });

    // Create member on save button click
    const createBtn = modal.querySelector('#create-member-btn');
    if (createBtn) {
        createBtn.addEventListener('click', async () => {
            // Get form data
            const form = modal.querySelector('#create-member-form');
            if (!form) return;

            // Validate form
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Get form values
            const name = form.querySelector('#member-name').value.trim();
            const email = form.querySelector('#member-email').value.trim();
            const role = form.querySelector('#member-role').value.trim();
            const department = form.querySelector('#member-department').value;

            // Create member data object
            const memberData = {
                name: name
            };

            // Add optional fields if provided
            if (email) memberData.email = email;
            if (role) memberData.role = role;
            if (department) memberData.department = department;

            // Show loading state
            createBtn.disabled = true;
            createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

            // Create the member
            try {
                const newMember = await createTeamMember(memberData);
                if (newMember) {
                    showNotification(`Team member "${name}" created successfully`, 'success');
                    closeModal(modal, backdrop);

                    // Reload team members list
                    if (typeof loadTeamMembers === 'function') {
                        setTimeout(() => {
                            loadTeamMembers();
                        }, 500);
                    } else {
                        console.error('loadTeamMembers function not found');
                        // Try to reload the page as a fallback
                        window.location.reload();
                    }
                } else {
                    createBtn.disabled = false;
                    createBtn.innerHTML = 'Add Member';
                }
            } catch (error) {
                console.error('Error creating team member:', error);
                showNotification('Failed to create team member', 'error');
                createBtn.disabled = false;
                createBtn.innerHTML = 'Add Member';
            }
        });
    }
}

// Function to set up event listeners for the edit member modal
function setupEditMemberModalEventListeners(modal, backdrop, member) {
    // Close modal on close button click
    const closeBtn = modal.querySelector('.close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on cancel button click
    const cancelBtn = modal.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(modal, backdrop);
        });
    }

    // Close modal on backdrop click
    backdrop.addEventListener('click', () => {
        closeModal(modal, backdrop);
    });

    // Update member on save button click
    const updateBtn = modal.querySelector('#update-member-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
            // Get form data
            const form = modal.querySelector('#edit-member-form');
            if (!form) return;

            // Validate form
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Get form values
            const name = form.querySelector('#member-name').value.trim();
            const email = form.querySelector('#member-email').value.trim();
            const role = form.querySelector('#member-role').value.trim();
            const department = form.querySelector('#member-department').value;

            // Create member data object
            const memberData = {
                name: name
            };

            // Add optional fields if provided
            if (email) memberData.email = email;
            if (role) memberData.role = role;
            if (department) memberData.department = department;

            // Show loading state
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

            // Update the member
            try {
                const updatedMember = await updateTeamMember(member._id, memberData);
                if (updatedMember) {
                    showNotification(`Team member "${name}" updated successfully`, 'success');
                    closeModal(modal, backdrop);

                    // Reload team members list
                    if (typeof loadTeamMembers === 'function') {
                        setTimeout(() => {
                            loadTeamMembers();
                        }, 500);
                    } else {
                        console.error('loadTeamMembers function not found');
                        // Try to reload the page as a fallback
                        window.location.reload();
                    }
                } else {
                    updateBtn.disabled = false;
                    updateBtn.innerHTML = 'Update Member';
                }
            } catch (error) {
                console.error('Error updating team member:', error);
                showNotification('Failed to update team member', 'error');
                updateBtn.disabled = false;
                updateBtn.innerHTML = 'Update Member';
            }
        });
    }
}

// Function to close modal
function closeModal(modal, backdrop) {
    // Hide modal with animation
    modal.classList.remove('show');
    backdrop.classList.remove('show');

    // Remove modal after animation
    setTimeout(() => {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
    }, 300);
}

// Function to create a team member
async function createTeamMember(memberData) {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create team member');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating team member:', error);
        showNotification(error.message || 'Failed to create team member', 'error');
        return null;
    }
}

// Function to update a team member
async function updateTeamMember(memberId, memberData) {
    try {
        const response = await fetch(`/api/users/${memberId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update team member');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating team member:', error);
        showNotification(error.message || 'Failed to update team member', 'error');
        return null;
    }
}
