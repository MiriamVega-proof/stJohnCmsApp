document.addEventListener('DOMContentLoaded', () => {

    let users = [];
    let apiData = null;

    let currentPage = 1;
    const usersPerPage = 10;
    let currentFilteredUsers = users;
    
    // --- DOM Elements & Modals ---
    const userTableBody = document.getElementById('userTableBody');
    const userSearch = document.getElementById('userSearch');
    const userRoleFilter = document.getElementById('userRoleFilter');
    const userStatusFilter = document.getElementById('userStatusFilter');
    
    // Check for required elements
    if (!userTableBody) {
        console.error('Critical error: userTableBody element not found!');
        return;
    }
    
    const userModalEl = document.getElementById('userModal');
    const passwordUpdateModalEl = document.getElementById('passwordUpdateModal');
    const archiveOrDeleteModalEl = document.getElementById('archiveOrDeleteModal');
    
    const userModal = userModalEl ? new bootstrap.Modal(userModalEl) : null;
    const passwordUpdateModal = passwordUpdateModalEl ? new bootstrap.Modal(passwordUpdateModalEl) : null;
    const archiveOrDeleteModal = archiveOrDeleteModalEl ? new bootstrap.Modal(archiveOrDeleteModalEl) : null;
    
    const userForm = document.getElementById('userForm');
    const passwordUpdateForm = document.getElementById('passwordUpdateForm');
    const creationPasswordFields = document.getElementById('creationPasswordFields');
    
    let currentUserId = null; 

    // --- API Functions ---
    const fetchUsers = async () => {
        try {
            showLoadingState();
            const response = await fetch('../../../../cms.api/fetchUsers.php');
            const data = await response.json();
            
            if (data.success) {
                apiData = data;
                // Transform API data to match our existing user structure
                users = data.data.map(user => ({
                    id: user.userId,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    role: user.role || 'Client',
                    status: user.status || 'Active', // Use actual status from database
                    lastLogin: user.updatedAt ? formatDateTime(user.updatedAt) : 'N/A',
                    contactNumber: user.contactNumber || '',
                    emergencyContactName: user.emergencyContactName || '',
                    emergencyContactNumber: user.emergencyContactNumber || '',
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }));
                
                hideLoadingState();
                applyInactivityCheck();
                filterAndRender();
            } else {
                throw new Error(data.error || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            hideLoadingState();
            showErrorMessage('Failed to load user data. Please try refreshing the page.');
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const showLoadingState = () => {
        const tableBody = document.getElementById('userTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4"><i class="fas fa-spinner fa-spin me-2"></i>Loading users...</td></tr>';
        }
    };

    const hideLoadingState = () => {
        // This will be handled by the renderTable function
    };

    const showErrorMessage = (message) => {
        const tableBody = document.getElementById('userTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-danger"><i class="fas fa-exclamation-triangle me-2"></i>${message}</td></tr>`;
        }
    };

    // API functions for user management
    const createUser = async (userData) => {
        try {
            const response = await fetch('../../../../cms.api/userManagement.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to create user');
            }
            return result;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    };

    const updateUserData = async (userData) => {
        try {
            const response = await fetch('../../../../cms.api/userManagement.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to update user');
            }
            return result;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };

    const deleteUserData = async (userId) => {
        try {
            const response = await fetch(`../../../../cms.api/userManagement.php?userId=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete user');
            }
            return result;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    };

    // --- Utility Functions (Unchanged) ---
    const getRoleClass = (role) => {
        switch(role) {
            case 'Admin': return 'badge-admin';
            case 'Secretary': return 'badge-secretary';
            case 'Client': return 'badge-client';
            default: return '';
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'Active': return 'status-active';
            case 'Inactive': return 'status-inactive';
            case 'Archived': return 'status-archived';
            case 'Deleted': return 'status-deleted';
            default: return '';
        }
    };

    const applyInactivityCheck = () => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90); 

        users.forEach(user => {
            if (user.status === 'Active' && user.lastLogin !== 'N/A' && user.lastLogin !== null) {
                const lastLoginDate = new Date(user.lastLogin);
                
                if (lastLoginDate < threeMonthsAgo) {
                    user.status = 'Inactive';
                }
            }
        });
    };

    /**
     * Handles the user logout process.
     */
    const handleLogout = (e) => {
        e.preventDefault(); 
        
        if (!confirm("Are you sure you want to log out?")) {
            return; 
        }

        const clickedLink = e.currentTarget;
        const redirectPath = clickedLink.getAttribute('href');
        
        if (redirectPath && redirectPath !== '#') {
            window.location.href = redirectPath; 
        } else {
            window.location.href = "../../frontend/auth/login/login.html";
        }
    };
    

    const togglePasswordVisibility = (e) => {
        const icon = e.currentTarget;
        const targetId = icon.dataset.target;
        const targetInput = document.getElementById(targetId);

        if (targetInput.type === 'password') {
            targetInput.type = 'text';
            // Change icon from hollow eye (far) to solid slash eye (fas)
            icon.classList.remove('far', 'fa-eye'); 
            icon.classList.add('fas', 'fa-eye-slash'); 
        } else {
            targetInput.type = 'password';
            // Change icon back
            icon.classList.remove('fas', 'fa-eye-slash');
            icon.classList.add('far', 'fa-eye');
        }
    };

    const setupPasswordToggles = () => {
        // Selects ALL elements with the class 'toggle-password'
        document.querySelectorAll('.toggle-password').forEach(icon => {
            // Remove listener first to prevent duplicate triggers
            icon.removeEventListener('click', togglePasswordVisibility); 
            icon.addEventListener('click', togglePasswordVisibility);
        });
    };

    // --- Metrics Calculation Function ---
    const updateMetrics = () => {
        let totalUsers, activeUsers, inactiveUsers, adminUsers;
        
        if (apiData) {
            // Use API provided counts when available
            totalUsers = apiData.totalCount || 0;
            adminUsers = apiData.adminCount || 0;
            activeUsers = apiData.activeCount || 0;
            inactiveUsers = (apiData.inactiveCount || 0) + (apiData.archivedCount || 0);
        } else {
            // Fallback to local calculation
            totalUsers = users.length;
            activeUsers = users.filter(user => user.status === 'Active').length;
            inactiveUsers = users.filter(user => user.status === 'Inactive' || user.status === 'Archived').length;
            adminUsers = users.filter(user => user.role === 'Admin').length;
        }

        // Update metric displays with animation
        animateCounter('totalUsersMetric', totalUsers);
        animateCounter('activeUsersMetric', activeUsers);
        animateCounter('inactiveUsersMetric', inactiveUsers);
        animateCounter('adminUsersMetric', adminUsers);
    };

    // --- Counter Animation Function ---
    const animateCounter = (elementId, targetValue) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000; // 1 second
        const startTime = Date.now();

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = targetValue; // Ensure final value is exact
            }
        };

        requestAnimationFrame(updateCounter);
    };


    // --- Core Rendering Function ---
    const renderTable = (filteredUsers) => {
        if (!userTableBody) {
            return;
        }
        
        userTableBody.innerHTML = '';
        const start = (currentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        const pageUsers = filteredUsers.slice(start, end);

        if (pageUsers.length === 0) {
            const noUsersMsg = document.getElementById('noUsersMessage');
            if (noUsersMsg) noUsersMsg.classList.remove('d-none');
            if (userTableBody.closest('.table-responsive')) {
                userTableBody.closest('.table-responsive').style.display = 'none';
            }
            return;
        }

        const noUsersMsg = document.getElementById('noUsersMessage');
        if (noUsersMsg) noUsersMsg.classList.add('d-none');
        if (userTableBody.closest('.table-responsive')) {
            userTableBody.closest('.table-responsive').style.display = 'block';
        }

        pageUsers.forEach((user, index) => {
            try {
                const row = userTableBody.insertRow();
                
                let statusActionBtn;
                if (user.status === 'Archived') {
                    statusActionBtn = `<button class="action-btn btn-activate" onclick="handleArchiveAction(${user.id}, 'Activate')" title="Activate Account"><i class="fas fa-undo"></i></button>`;
                } else {
                    statusActionBtn = `<button class="action-btn btn-archive" onclick="openArchiveOrDeleteModal(${user.id})" title="Archive/Delete"><i class="fas fa-archive"></i></button>`;
                }

                row.innerHTML = `
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>${user.email}</td>
                    <td><span class="status-badge ${getRoleClass(user.role)}">${user.role}</span></td>
                    <td class="text-center"><span class="status-badge ${getStatusClass(user.status)}">${user.status}</span></td>
                    <td>${user.lastLogin}</td>
                    <td class="text-center">
                        <div class="action-buttons">
                            <button class="action-btn btn-edit" onclick="openEditUserModal(${user.id})" title="Edit User Details"><i class="fas fa-pencil"></i></button>
                            <button class="action-btn btn-reset-pw" onclick="openPasswordUpdateModal(${user.id})" title="Admin Set Password"><i class="fas fa-key"></i></button>
                            ${statusActionBtn}
                        </div>
                    </td>
                `;
            } catch (error) {
                console.error(`Error rendering user ${index + 1}:`, error, user);
            }
        });
        
        // Update pagination info
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages || 1}`;
        document.getElementById('prevPageBtn').disabled = currentPage === 1;
        document.getElementById('nextPageBtn').disabled = currentPage === totalPages || filteredUsers.length === 0;
    };

    // --- Filtering and Search Logic (Unchanged) ---
    const filterAndRender = () => {
        const searchText = userSearch.value.toLowerCase();
        const selectedRole = userRoleFilter.value;
        const selectedStatus = userStatusFilter.value;

        const filtered = users.filter(user => {
            const matchesSearch = user.firstName.toLowerCase().includes(searchText) || 
                                 user.lastName.toLowerCase().includes(searchText) || 
                                 user.email.toLowerCase().includes(searchText) ||
                                 user.role.toLowerCase().includes(searchText);
            
            const matchesRole = selectedRole === 'All' || user.role === selectedRole;
            const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });

        currentFilteredUsers = filtered;
        currentPage = 1;
        renderTable(currentFilteredUsers);
        updateMetrics(); // Update metrics whenever data changes
    };
    
    if (userSearch) {
        userSearch.addEventListener('input', filterAndRender);
    }
    
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (userSearch) {
                userSearch.value = '';
                filterAndRender();
            }
        });
    }
    
    if (userRoleFilter) {
        userRoleFilter.addEventListener('change', filterAndRender);
    }
    
    if (userStatusFilter) {
        userStatusFilter.addEventListener('change', filterAndRender);
    }
    
    const prevPageBtn = document.getElementById('prevPageBtn');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable(currentFilteredUsers);
            }
        });
    }

    const nextPageBtn = document.getElementById('nextPageBtn');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(currentFilteredUsers.length / usersPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable(currentFilteredUsers);
            }
        });
    }

    // --- User Modal Logic (General Info Edit/Creation) ---

    // 1. ADD NEW USER - Function to handle modal opening
    const openAddUserModal = () => {
        document.getElementById('modalActionText').textContent = 'Create New User';
        userForm.reset();
        document.getElementById('userId').value = '';
        
        // Show and require password fields for creation
        creationPasswordFields.classList.remove('d-none');
        document.getElementById('password').required = true;
        document.getElementById('confirmPassword').required = true;
        
        document.getElementById('email').classList.remove('is-invalid');
        document.getElementById('emailFeedback').textContent = '';

        document.getElementById('saveUserBtn').textContent = 'Create User';
        if (userModal) {
            userModal.show();
        }
    };

    // Add event listeners for both desktop and mobile add buttons
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }
    
    // Add mobile button listener if it exists
    const mobileAddBtn = document.getElementById('addUserBtnMobile');
    if (mobileAddBtn) {
        mobileAddBtn.addEventListener('click', openAddUserModal);
    }

    // 2. EDIT USER 
    window.openEditUserModal = (id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        document.getElementById('modalActionText').textContent = `Edit User: ${user.firstName} ${user.lastName}`;
        document.getElementById('userId').value = user.id;
        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('status').value = user.status;

        // Hide and unrequire password fields for editing
        creationPasswordFields.classList.add('d-none');
        document.getElementById('password').required = false;
        document.getElementById('confirmPassword').required = false;

        document.getElementById('email').classList.remove('is-invalid');
        document.getElementById('emailFeedback').textContent = '';
        
        document.getElementById('saveUserBtn').textContent = 'Save Changes';
        currentUserId = id;
        if (userModal) {
            userModal.show();
        }
    };
    
    // 3. Form Submission (Create or Edit)
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('userId').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        const status = document.getElementById('status').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Reset validation classes
        document.getElementById('email').classList.remove('is-invalid');
        
        // Disable the save button and show loading
        const saveBtn = document.getElementById('saveUserBtn');
        const originalBtnText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';

        try {
            if (id) {
                // EDIT/UPDATE Logic
                const userData = {
                    userId: parseInt(id),
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: role,
                    status: status
                };
                
                await updateUserData(userData);
                alert(`User ${firstName} ${lastName} updated successfully!`);
            } else {
                // CREATE Logic - Validate password first
                if (password.length < 6) { 
                    alert('Error: Password must be at least 6 characters long.');
                    return;
                }
                if (password !== confirmPassword) {
                    alert('Error: Passwords do not match!');
                    return;
                }

                const userData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: role,
                    status: status,
                    password: password
                };
                
                await createUser(userData);
                alert(`User ${firstName} ${lastName} created successfully!`);
            }

            if (userModal) {
                userModal.hide();
            }
            
            // Refresh the user list
            await fetchUsers();
            
        } catch (error) {
            console.error('Error saving user:', error);
            if (error.message.includes('email already exists')) {
                document.getElementById('email').classList.add('is-invalid');
                document.getElementById('emailFeedback').textContent = 'Error: An account with this email already exists.';
            } else {
                alert('Error: ' + error.message);
            }
        } finally {
            // Re-enable the save button
            saveBtn.disabled = false;
            saveBtn.textContent = originalBtnText;
        }
        });
    }

    // --- Admin Direct Password Update Logic ---

    window.openPasswordUpdateModal = (id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        document.getElementById('updateUserId').value = id;
        document.getElementById('passwordUpdateMessage').innerHTML = `You are directly setting a new password for <strong>${user.firstName} ${user.lastName} (${user.role})</strong>. Ensure they are immediately notified.`;
        
        passwordUpdateForm.reset();
        document.getElementById('newPassword').classList.remove('is-invalid');
        document.getElementById('confirmNewPassword').classList.remove('is-invalid');
        document.getElementById('confirmNewPasswordFeedback').textContent = 'Passwords do not match.';

        if (passwordUpdateModal) {
            passwordUpdateModal.show();
        }
    };
    
    if (passwordUpdateForm) {
        passwordUpdateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('updateUserId').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Reset validation classes
        document.getElementById('newPassword').classList.remove('is-invalid');
        document.getElementById('confirmNewPassword').classList.remove('is-invalid');

        // --- VALIDATION: Password Match and Length ---
        if (newPassword.length < 6) {
            document.getElementById('newPassword').classList.add('is-invalid');
            document.getElementById('newPassword').nextElementSibling.textContent = 'Password must be at least 6 characters long.';
            return;
        }

        if (newPassword !== confirmNewPassword) {
            document.getElementById('confirmNewPassword').classList.add('is-invalid');
            return;
        }

        // --- UPDATE LOGIC ---
        const userIndex = users.findIndex(u => u.id == id);
        if(userIndex !== -1) {
            users[userIndex].password = newPassword; 
        }

        alert(`Password for user ID ${id} has been successfully updated.`);
        if (passwordUpdateModal) {
            passwordUpdateModal.hide();
        }
        });
    }

    // 5. Archive / Activate / Delete Logic (Unchanged)
    window.openArchiveOrDeleteModal = (id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        
        document.getElementById('archiveModalTitle').textContent = `Action for ${user.firstName} ${user.lastName}`;
        document.getElementById('archiveModalText').innerHTML = `You are performing an action on <strong>${user.firstName} ${user.lastName} (${user.role})</strong>. Do you want to **Archive** this account (setting status to Archived) or **Delete** it permanently?`;

        currentUserId = id;
        if (archiveOrDeleteModal) {
            archiveOrDeleteModal.show();
        }
    };
    
    window.handleArchiveAction = async (id, action) => {
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) return;

        try {
            if (action === 'Archive') {
                // Update status in database
                await updateUserData({
                    userId: id,
                    status: 'Archived'
                });
                alert(`User ID ${id} account has been Archived.`);
                // Refresh the user list to reflect database changes
                await fetchUsers();
            } else if (action === 'Activate') {
                // Update status in database
                await updateUserData({
                    userId: id,
                    status: 'Active'
                });
                alert(`User ID ${id} account has been Activated.`);
                // Refresh the user list to reflect database changes
                await fetchUsers();
            } else if (action === 'Delete') {
                // Actually delete from database
                await deleteUserData(id);
                alert(`User ID ${id} has been permanently deleted from the database.`);
                // Refresh the user list to reflect database changes
                await fetchUsers();
            }
            
            if (archiveOrDeleteModal) {
                archiveOrDeleteModal.hide();
            }
            
            // All actions now refresh from API, so no need for local re-rendering
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Error: ' + error.message);
            if (archiveOrDeleteModal) {
                archiveOrDeleteModal.hide();
            }
        }
    };

    const confirmArchiveBtn = document.getElementById('confirmArchiveBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    if (confirmArchiveBtn) {
        confirmArchiveBtn.addEventListener('click', () => {
            handleArchiveAction(currentUserId, 'Archive');
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if(confirm("WARNING: Permanent deletion cannot be undone. Are you absolutely sure?")) {
                handleArchiveAction(currentUserId, 'Delete');
            }
        });
    }

    const logoutLinks = document.querySelectorAll('#logoutLinkDesktop, #logoutLinkMobile');
    logoutLinks.forEach(link => {
        if (link) {
            link.addEventListener("click", handleLogout);
        }
    });
    // END LOGOUT LOGIC


    // Attach setupPasswordToggles to the Bootstrap modal 'shown' event
    if (userModalEl) {
        userModalEl.addEventListener('shown.bs.modal', setupPasswordToggles);
    }

    if (passwordUpdateModalEl) {
        passwordUpdateModalEl.addEventListener('shown.bs.modal', setupPasswordToggles);
    }
    
    // INITIAL LOAD
    fetchUsers(); // This will call applyInactivityCheck() and filterAndRender() after loading data
});