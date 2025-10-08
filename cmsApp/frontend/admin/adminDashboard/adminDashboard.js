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
  console.log('=== FETCHING APPOINTMENTS DATA ===');
  
  fetch('../../../../cms.api/fetchAppointments.php')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('=== APPOINTMENTS DATA ===');
      
      if (data.success) {
        console.log('✅ Success:', data.message);
        console.log('📊 Total Appointments:', data.data.length);
        
        if (data.data.length > 0) {
          console.log('📋 All Appointments Data:');
          console.table(data.data);
          
          // Count appointments by status ID
          let scheduledCount = 0;
          let completedCount = 0;
          let cancelledCount = 0;
          let otherCount = 0;
          
          data.data.forEach((appointment) => {
            const statusId = parseInt(appointment.statusId) || 0;
            if (statusId === 0) {
              scheduledCount++;
            } else if (statusId === 1) {
              completedCount++;
            } else if (statusId === 2) {
              cancelledCount++;
            } else {
              otherCount++;
            }
          });
          
          console.log('📊 Appointment Status Counts:');
          console.log(`   Scheduled (Status ID 0): ${scheduledCount}`);
          console.log(`   Completed (Status ID 1): ${completedCount}`);
          console.log(`   Cancelled (Status ID 2): ${cancelledCount}`);
          console.log(`   Other Status: ${otherCount}`);
          
          // Update the dashboard counts
          updateAppointmentStatusCounts(scheduledCount, completedCount, cancelledCount);
          
          console.log('📝 Appointments List:');
          data.data.forEach((appointment, index) => {
            console.log(`${index + 1}. Appointment ID: ${appointment.appointmentId}`);
            console.log(`   Client: ${appointment.clientName}`);
            console.log(`   Address: ${appointment.clientAddress}`);
            console.log(`   Contact: ${appointment.clientContactNumber}`);
            console.log(`   Date: ${appointment.dateRequested}`);
            console.log(`   Time: ${appointment.time}`);
            console.log(`   Purpose: ${appointment.purpose}`);
            console.log(`   Status ID: ${appointment.statusId}`);
            console.log(`   Created At: ${appointment.createdAt}`);
            console.log('   ---');
          });
          
        } else {
          console.log('ℹ️ No appointments found in the database');
          // Update with 0 counts if no appointments found
          updateAppointmentStatusCounts(0, 0, 0);
        }
      } else {
        console.error('❌ API Error:', data.message);
      }
      
      console.log('=== END APPOINTMENTS DATA ===');
    })
    .catch(error => {
      console.error('🚨 Fetch Error:', error.message);
      console.error('💡 Check if XAMPP is running and fetchAppointments.php exists');
    });

  // Function to update appointment status counts on dashboard
  function updateAppointmentStatusCounts(scheduledCount, completedCount, cancelledCount) {
    // Update scheduled appointment count (statusId = 0)
    const scheduledElement = document.getElementById('scheduled-appointment-count');
    if (scheduledElement) {
      scheduledElement.textContent = scheduledCount;
      console.log(`✅ Updated scheduled appointment count to: ${scheduledCount}`);
    } else {
      console.warn('⚠️ Element with ID "scheduled-appointment-count" not found');
    }
    
    // You can also update other appointment counts if needed in the future
    // For example, if you have elements for completed and cancelled counts
    
    console.log(`📈 Dashboard updated - Scheduled: ${scheduledCount}, Completed: ${completedCount}, Cancelled: ${cancelledCount}`);
  }
});
