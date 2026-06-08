// --- State Management for Interactive Dashboard ---
let employees = [
  { id: 1, name: 'Mogith Raj', email: 'mogith@fisher.com', dept: 'Product', status: 'active' },
  { id: 2, name: 'Sarah Alvi', email: 'sarah.a@fisher.com', dept: 'Design', status: 'leave' },
  { id: 3, name: 'Jordan Vance', email: 'jordan.v@fisher.com', dept: 'Engineering', status: 'active' }
];

// Helper to map status to UI details
const statusMap = {
  active: { label: 'On Duty', class: 'active' },
  remote: { label: 'Remote', class: 'remote' },
  leave: { label: 'On Leave', class: 'leave' }
};

// Render Directory Table & Update Metrics
function renderDirectory() {
  const tableBody = document.getElementById('employee-list-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  
  employees.forEach(emp => {
    const statusInfo = statusMap[emp.status] || { label: 'On Duty', class: 'active' };
    const initials = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    // Choose custom background styling based on initials to add color variety
    let avatarBg = 'var(--primary-gradient)';
    if (emp.dept === 'Design') {
      avatarBg = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (emp.dept === 'Engineering') {
      avatarBg = 'linear-gradient(135deg, #3b82f6, #0891b2)';
    } else if (emp.dept === 'Marketing') {
      avatarBg = 'linear-gradient(135deg, #f59e0b, #eab308)';
    } else if (emp.dept === 'Operations') {
      avatarBg = 'linear-gradient(135deg, #ec4899, #d946ef)';
    }

    const rowHtml = `
      <tr id="emp-row-${emp.id}">
        <td>
          <div class="employee-profile">
            <div class="emp-avatar" style="background: ${avatarBg}">${initials}</div>
            <div>
              <div style="font-weight:600;">${emp.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${emp.email}</div>
            </div>
          </div>
        </td>
        <td>${emp.dept}</td>
        <td>
          <span class="emp-status ${statusInfo.class}" onclick="toggleEmployeeStatus(${emp.id})" style="cursor:pointer;" title="Click to cycle status">
            <span class="status-dot"></span> ${statusInfo.label}
          </span>
        </td>
        <td>
          <button class="action-btn-delete" onclick="deleteEmployee(${emp.id})" aria-label="Delete ${emp.name}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', rowHtml);
  });

  updateMetrics();
}

// Calculate and Update Dashboard aggregates
function updateMetrics() {
  const totalCountEl = document.getElementById('total-count');
  const onDutyCountEl = document.getElementById('on-duty-count');
  const attendanceRateEl = document.getElementById('attendance-rate');
  const countLabelEl = document.getElementById('directory-count-label');

  const total = employees.length;
  const onDuty = employees.filter(emp => emp.status === 'active' || emp.status === 'remote').length;
  const rate = total > 0 ? Math.round((onDuty / total) * 100) : 0;

  if (totalCountEl) totalCountEl.textContent = total;
  if (onDutyCountEl) onDutyCountEl.textContent = onDuty;
  if (attendanceRateEl) attendanceRateEl.textContent = `${rate}%`;
  if (countLabelEl) countLabelEl.textContent = `Showing ${total} active ${total === 1 ? 'entry' : 'entries'}`;
}

// Cycle employee status (active -> remote -> leave -> active)
function toggleEmployeeStatus(id) {
  const empIndex = employees.findIndex(emp => emp.id === id);
  if (empIndex === -1) return;

  const currentStatus = employees[empIndex].status;
  if (currentStatus === 'active') {
    employees[empIndex].status = 'remote';
  } else if (currentStatus === 'remote') {
    employees[empIndex].status = 'leave';
  } else {
    employees[empIndex].status = 'active';
  }

  renderDirectory();
}

// Delete employee from roster
function deleteEmployee(id) {
  employees = employees.filter(emp => emp.id !== id);
  renderDirectory();
}

// Form Submission Handler
function handleFormSubmit(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById('emp-name');
  const emailInput = document.getElementById('emp-email');
  const deptInput = document.getElementById('emp-dept');
  const statusInput = document.getElementById('emp-status');

  if (!nameInput || !emailInput || !deptInput || !statusInput) return;

  const newEmp = {
    id: Date.now(),
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    dept: deptInput.value,
    status: statusInput.value
  };

  employees.push(newEmp);
  renderDirectory();

  // Reset Form fields
  nameInput.value = '';
  emailInput.value = '';
  deptInput.selectedIndex = 0;
  statusInput.selectedIndex = 0;
}

// Bind interactive functions to window scope for inline onclick support
window.toggleEmployeeStatus = toggleEmployeeStatus;
window.deleteEmployee = deleteEmployee;
window.handleFormSubmit = handleFormSubmit;


// --- Theme Switcher Logic ---
const themeToggler = document.getElementById('theme-toggler');
if (themeToggler) {
  // Check local storage or media preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    document.body.classList.add('light-theme');
  }

  themeToggler.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
  });
}


// --- Responsive Mobile Navbar ---
const hamburger = document.getElementById('hamburger-menu');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking nav links
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      
      // Update active state
      navLinks.forEach(item => item.classList.remove('active'));
      link.classList.add('active');
    });
  });
}


// --- Sticky Header Styling on Scroll ---
window.addEventListener('scroll', () => {
  const header = document.getElementById('main-header');
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Update navbar active link depending on section visibility
  const sections = document.querySelectorAll('section');
  const scrollPosition = window.scrollY + 120; // offset

  sections.forEach(section => {
    if (section.id) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      
      if (scrollPosition >= top && scrollPosition < top + height) {
        const activeLink = document.querySelector(`.nav-links a[href="#${section.id}"]`);
        if (activeLink) {
          document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
          activeLink.classList.add('active');
        }
      }
    }
  });
});


// --- Intersection Observer for Fade/Slide-in Animations ---
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealElements.length > 0) {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
} else {
  // Fallback: immediately show all items
  revealElements.forEach(el => el.classList.add('active'));
}


// --- Testimonial Carousel Slider ---
let activeTestimonial = 0;
const testimonials = [
  document.getElementById('test-card-1'),
  document.getElementById('test-card-2'),
  document.getElementById('test-card-3')
];
const dots = document.querySelectorAll('.slider-dots .slider-dot');

function showTestimonial(index) {
  if (index < 0 || index >= testimonials.length) return;
  
  // Update state
  activeTestimonial = index;
  
  // Transition views
  testimonials.forEach((card, idx) => {
    if (card) {
      card.style.display = idx === index ? 'block' : 'none';
      card.style.opacity = idx === index ? '0' : '1';
      
      if (idx === index) {
        // Simple fade transition trigger
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease';
          card.style.opacity = '1';
        }, 10);
      }
    }
  });

  // Toggle dot active highlight
  dots.forEach((dot, idx) => {
    if (dot) {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    }
  });
}

// Auto Cycle Testimonials every 7 seconds
let testimonialInterval = setInterval(() => {
  let next = (activeTestimonial + 1) % testimonials.length;
  showTestimonial(next);
}, 7000);

// Clear interval when user clicks manually
window.showTestimonial = (index) => {
  clearInterval(testimonialInterval);
  showTestimonial(index);
};

// Initialize interactive table and layout elements on load
document.addEventListener('DOMContentLoaded', () => {
  renderDirectory();
});
