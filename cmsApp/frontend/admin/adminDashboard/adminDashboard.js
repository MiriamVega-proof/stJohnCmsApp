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
      console.warn(" No logout links found. Make sure IDs #logoutLinkDesktop or #logoutLinkMobile exist in your HTML.");
      return;
    }

    logoutLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        console.log("Logout link clicked:", link.id); 
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
        // Get both counts from the response
        const totalReservations = data.totalCount;
        const todayReservations = data.todayCount;
        
        console.log('📊 Total Reservations:', totalReservations);
        console.log('📅 Today\'s Reservations:', todayReservations);
        console.log('📆 Today\'s Date:', data.today);
        
        // Update both counters
        updateReservationCounters(totalReservations, todayReservations);
        
      } else {
        console.error('Database error:', data.error);
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });

  // Function to update reservation metrics
  function updateReservationCounters(totalCount, todayCount) {
    console.log('📊 Total count: ' + totalCount);
    console.log('📅 Today count: ' + todayCount);
    
    // Update total reservations
    const totalReservationsElem = document.getElementById('total-reservations');
    if (totalReservationsElem) {
      totalReservationsElem.textContent = totalCount;
      console.log('✅ Updated total-reservations element');
    } else {
      console.warn('⚠️ Element with ID total-reservations not found.');
    }
    
    // Update today's reservations
    const todayReservationsElem = document.getElementById('today-reservations');
    if (todayReservationsElem) {
      todayReservationsElem.textContent = todayCount;
      console.log('✅ Updated today-reservations element');
    } else {
      console.warn('⚠️ Element with ID today-reservations not found.');
    }
    
    // Alternative selectors (in case you use different IDs)
    const possibleTodaySelectors = [
      '#reservations-today',
      '#daily-reservations', 
      '.today-count',
      '#todayCount'
    ];
    
    possibleTodaySelectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = todayCount;
        console.log(`✅ Updated ${selector} with today's count: ${todayCount}`);
      }
    });
  }
});
