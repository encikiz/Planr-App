// Solid Team Modal - A completely new implementation with guaranteed solid backgrounds

// Function to open the add team member modal
function openSolidAddMemberModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'solid-modal-overlay';
    modalOverlay.id = 'solid-add-member-modal';
    
    // Create modal HTML
    modalOverlay.innerHTML = `
        <div class="solid-modal">
            <div class="solid-modal-header">
                <h3>Add New Team Member</h3>
                <button type="button" class="solid-modal-close" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="solid-modal-body">
                <form id="solid-add-member-form">
                    <div class="solid-form-group">
                        <label for="solid-member-name">Name <span class="required">*</span></label>
                        <input type="text" id="solid-member-name" name="name" required>
                    </div>
                    <div class="solid-form-group">
                        <label for="solid-member-email">Email (optional)</label>
                        <input type="email" id="solid-member-email" name="email">
                    </div>
                    <div class="solid-form-group">
                        <label for="solid-member-role">Role (optional)</label>
                        <input type="text" id="solid-member-role" name="role" placeholder="e.g. Developer, Designer">
                    </div>
                    <div class="solid-form-group">
                        <label for="solid-member-department">Department (optional)</label>
                        <select id="solid-member-department" name="department">
                            <option value="">Select Department</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Product">Product</option>
                            <option value="Marketing">Marketing</option>
                            <option value="IT">IT</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="solid-modal-footer">
                <button type="button" class="solid-btn-secondary solid-cancel-btn">Cancel</button>
                <button type="button" class="solid-btn-primary solid-save-btn">Add Member</button>
            </div>
        </div>
    `;
    
    // Add to the DOM
    document.body.appendChild(modalOverlay);
    
    // Add event listeners
    const closeBtn = modalOverlay.querySelector('.solid-modal-close');
    const cancelBtn = modalOverlay.querySelector('.solid-cancel-btn');
    const saveBtn = modalOverlay.querySelector('.solid-save-btn');
    
    closeBtn.addEventListener('click', () => {
        closeSolidModal(modalOverlay);
    });
    
    cancelBtn.addEventListener('click', () => {
        closeSolidModal(modalOverlay);
    });
    
    saveBtn.addEventListener('click', async () => {
        const name = document.getElementById('solid-member-name').value.trim();
        const email = document.getElementById('solid-member-email').value.trim();
        const role = document.getElementById('solid-member-role').value.trim();
        const department = document.getElementById('solid-member-department').value;
        
        if (!name) {
            showNotification('Name is required', 'error');
            return;
        }
        
        // Create member data object
        const memberData = {
            name,
            email: email || undefined, // Only include if provided
            role: role || undefined, // Only include if provided
            department: department || undefined // Only include if provided
        };
        
        // Call API to create new member
        const success = await createNewTeamMember(memberData);
        if (success) {
            closeSolidModal(modalOverlay);
            // Reload team members list
            await loadTeamMembers();
        }
    });
    
    // Add animation
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
}

// Function to close modal
function closeSolidModal(modalElement) {
    modalElement.classList.remove('active');
    setTimeout(() => {
        modalElement.remove();
    }, 300);
}

// Function to create a new team member via API
async function createNewTeamMember(memberData) {
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
        
        const newMember = await response.json();
        showNotification(`${newMember.name} has been added to the team`, 'success');
        return true;
    } catch (error) {
        console.error('Error creating team member:', error);
        showNotification(error.message || 'Failed to create team member', 'error');
        return false;
    }
}

// Add event listener to the new member button
document.addEventListener('DOMContentLoaded', function() {
    const newMemberBtn = document.querySelector('.new-member-btn');
    if (newMemberBtn) {
        // Remove any existing event listeners
        newMemberBtn.replaceWith(newMemberBtn.cloneNode(true));
        
        // Get the new button reference
        const newBtn = document.querySelector('.new-member-btn');
        
        // Add our new event listener
        newBtn.addEventListener('click', openSolidAddMemberModal);
    }
});
