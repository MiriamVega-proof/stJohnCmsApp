document.addEventListener('DOMContentLoaded', function() {
  const ctx = document.getElementById('incomeChart');
  if (ctx) {
    const incomeChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Income (₱)',
          data: [40000, 50000, 55000, 60000],
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₱' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  const navItems = document.querySelectorAll('.nav-item');
  const currentPath = window.location.pathname.split('/').pop(); 

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === currentPath || (currentPath === 'adminDashboard.html' && item.getAttribute('href') === 'adminDashboard.html')) {
      item.classList.add('active');
    }
  });


  function attachLogoutHandlers() {
    const logoutLinks = document.querySelectorAll('#logoutLinkDesktop, #logoutLinkMobile');

    if (logoutLinks.length === 0) {
      return;
    }

    logoutLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const confirmed = confirm('Are you sure you want to log out?');
        if (confirmed) {
          const redirectPath = link.getAttribute('href') && link.getAttribute('href') !== '#'
            ? link.getAttribute('href')
            : '../../frontend/auth/login/login.html';
          window.location.href = redirectPath;
        }
      });
    });
  }


  setTimeout(attachLogoutHandlers, 200);
  
  // Fetch data from reservations table
  fetch('../../../../cms.api/fetchReservations.php')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {

      if (data.success) {
        // Get all counts from the response
        const totalReservations = data.totalCount;
        const todayReservations = data.todayCount;
        const weekReservations = data.weekCount;
        
        // console.log('Total Reservations:', totalReservations);
        // console.log('Today\'s Reservations:', todayReservations);
        // console.log('This Week\'s Reservations:', weekReservations);
        // console.log('Today\'s Date:', data.today);
        // console.log('Week Range:', data.weekRange);
        
        // Update all counters
        updateReservationCounters(totalReservations, todayReservations, weekReservations);
        
      }
    })
    .catch(error => {
      // Handle fetch errors silently
    });

  // Function to update reservation metrics
  function updateReservationCounters(totalCount, todayCount, weekCount) {
    // Update total reservations
    const totalReservationsElem = document.getElementById('total-reservations');
    if (totalReservationsElem) {
      totalReservationsElem.textContent = totalCount;
    }
    
    // Update today's reservations
    const todayReservationsElem = document.getElementById('today-reservations');
    if (todayReservationsElem) {
      todayReservationsElem.textContent = todayCount;
    }
    
    // Update this week's reservations
    const weekReservationsElem = document.getElementById('week-reservations');
    if (weekReservationsElem) {
      weekReservationsElem.textContent = weekCount;
    }
    
    // Alternative selectors for today
    const possibleTodaySelectors = [
      '#reservations-today',
      '#daily-reservations', 
      '.today-count',
      '#todayCount'
    ];
    
    // Alternative selectors for week
    const possibleWeekSelectors = [
      '#reservations-week',
      '#weekly-reservations', 
      '.week-count',
      '#weekCount',
      '#this-week-reservations'
    ];
    
    possibleTodaySelectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = todayCount;
      }
    });
    
    possibleWeekSelectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = weekCount;
      }
    });
  }

  // Fetch data from appointments table
  fetch('../../../../cms.api/fetchAppointments.php')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        if (data.data.length > 0) {
          
          // Count appointments by status enum
          let scheduledCount = 0;
          let completedCount = 0;
          let cancelledCount = 0;
          let emptyStatusCount = 0;
          
          data.data.forEach((appointment) => {
            const status = (appointment.status || '').toLowerCase().trim();
            const statusId = parseInt(appointment.statusId) || 0;
            
            // Use status enum if available, otherwise fall back to statusId
            if (status === 'scheduled' || (status === '' && statusId === 0)) {
              scheduledCount++;
            } else if (status === 'completed') {
              completedCount++;
            } else if (status === 'cancelled') {
              cancelledCount++;
            } else if (status === '') {
              emptyStatusCount++;
            }
          });
          
          // Update the dashboard counts
          updateAppointmentStatusCounts(scheduledCount, completedCount, cancelledCount);
          
        } else {
          // Update with 0 counts if no appointments found
          updateAppointmentStatusCounts(0, 0, 0);
        }
      }
    })
    .catch(error => {
      // Handle fetch errors silently
    });

  // Function to update appointment status counts on dashboard
  function updateAppointmentStatusCounts(scheduledCount, completedCount, cancelledCount) {
    // Update scheduled appointment count
    const scheduledElement = document.getElementById('scheduled-appointment-count');
    if (scheduledElement) {
      scheduledElement.textContent = scheduledCount;
    }
    
    // Update cancelled appointment count
    const cancelledElement = document.getElementById('cancelled-appointment-count');
    if (cancelledElement) {
      cancelledElement.textContent = cancelledCount;
    }
    
    // Update completed appointment count
    const completedElement = document.getElementById('completed-appointment-count');
    if (completedElement) {
      completedElement.textContent = completedCount;
    }
  }

  // Fetch maintenance request counts
  fetch('../../../../cms.api/fetchMaintenanceRequests.php?action=count_by_status')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        updateMaintenanceStatusCounts(data.data.pending, data.data.in_progress, data.data.completed);
      } else {
        // Update with 0 counts if no maintenance requests found
        updateMaintenanceStatusCounts(0, 0, 0);
      }
    })
    .catch(error => {
      // Handle fetch errors silently and update with 0 counts
      updateMaintenanceStatusCounts(0, 0, 0);
    });

  // Function to update maintenance request status counts on dashboard
  function updateMaintenanceStatusCounts(pendingCount, inProgressCount, completedCount) {
    // Update pending maintenance count
    const pendingElement = document.getElementById('pending-maintenance-count');
    if (pendingElement) {
      pendingElement.textContent = pendingCount;
    }
    
    // Update in progress maintenance count
    const inProgressElement = document.getElementById('inprogress-maintenance-count');
    if (inProgressElement) {
      inProgressElement.textContent = inProgressCount;
    }
    
    // Update completed maintenance count
    const completedElement = document.getElementById('completed-maintenance-count');
    if (completedElement) {
      completedElement.textContent = completedCount;
    }
  }

  // Fetch user data from users table
  fetch('../../../../cms.api/fetchUsers.php')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Get all counts from the response
        const totalUsers = data.totalCount;
        const activeUsers = data.activeCount;
        const clientCount = data.clientCount;
        const todayNewUsers = data.todayCount;

        // console.log("total users: " + totalUsers);
        
        // Update user-related counters
        updateUserCounters(totalUsers, activeUsers, clientCount, todayNewUsers);
      } else {
        // Update with 0 counts if fetch fails
        updateUserCounters(0, 0, 0, 0);
      }
    })
    .catch(error => {
      // Handle fetch errors silently and update with 0 counts
      updateUserCounters(0, 0, 0, 0);
    });

  // Function to update user-related counts on dashboard
  function updateUserCounters(totalUsers, activeUsers, clientCount, todayNewUsers) {
    // Update registered clients count
    const registeredClientsElement = document.getElementById('registered-clients-count');
    if (registeredClientsElement) {
      registeredClientsElement.textContent = clientCount;
    }
    
    // Update active users count (24h) - using today's new users as a proxy
    const activeUsersElement = document.getElementById('active-users-count');
    if (activeUsersElement) {
      activeUsersElement.textContent = todayNewUsers;
    }
    
    // Update pending approvals count (using a default value for now)
    const pendingApprovalsElement = document.getElementById('pending-approvals-count');
    if (pendingApprovalsElement) {
      // This could be enhanced to get actual pending approvals count
      pendingApprovalsElement.textContent = '0';
    }
  }
});
