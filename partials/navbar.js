/**
 * Unified Navbar Loader
 * Loads the shared navbar component from partials/navbar.html
 * Works for all pages across the application
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the current page name
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isStudentPage = window.location.pathname.includes('/student/');
  const isAdminPage = window.location.pathname.includes('/admin/');
  
  // Set the correct path to partials/navbar.html based on current location
  let navbarPath = 'partials/navbar.html';
  let logoPath = 'public/Logo.png';
  let basePath = '';
  
  if (isStudentPage) {
    navbarPath = '../partials/navbar.html';
    logoPath = '../public/Logo.png';
    basePath = '../';
  } else if (isAdminPage) {
    navbarPath = '../partials/navbar.html';
    logoPath = '../public/Logo.png';
    basePath = '../';
  }
  
  // Fetch and load the navbar
  fetch(navbarPath)
    .then(response => response.text())
    .then(html => {
      // Create a temporary container
      const temp = document.createElement('div');
      temp.innerHTML = html;
      
      // Fix all paths in the navbar for current location
      const navbarHeader = temp.querySelector('#navbar-header');
      
      // Update logo path
      const logo = navbarHeader.querySelector('.logo');
      logo.src = logoPath;
      
      // Update all navigation links with correct base path
      const navLinks = navbarHeader.querySelectorAll('nav a');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href.startsWith('http')) {
          link.href = basePath + href;
        }
      });
      
      // Show/hide relevant links based on page type
      filterNavLinks(navbarHeader, isStudentPage, isAdminPage, basePath);
      
      // Replace existing header or insert at beginning of body
      const existingHeader = document.querySelector('header');
      if (existingHeader) {
        existingHeader.parentNode.replaceChild(navbarHeader, existingHeader);
      } else {
        document.body.insertBefore(navbarHeader, document.body.firstChild);
      }
      
      // Mark current page as active
      setActiveNavLink(currentPage, basePath);
      
      // Apply responsive navbar styling
      applyNavbarStyles();
    })
    .catch(error => console.error('Error loading navbar:', error));
});

/**
 * Filter navbar links based on page type - show only relevant links
 */
function filterNavLinks(navbarHeader, isStudentPage, isAdminPage, basePath) {
  const navLinks = navbarHeader.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const linkId = link.getAttribute('id');
    let shouldShow = false;
    
    // Determine which links to show based on current page type
    if (isStudentPage) {
      // Show student-specific links
      const studentLinks = ['nav-student-home', 'nav-dashboard', 'nav-worksheets', 'nav-progress', 'nav-student-settings', 'nav-logout'];
      shouldShow = studentLinks.includes(linkId);
    } else if (isAdminPage) {
      // Show admin-specific links
      const adminLinks = ['nav-admin-home', 'nav-admin-students', 'nav-admin-worksheets', 'nav-subscription', 'nav-admin-settings', 'nav-logout'];
      shouldShow = adminLinks.includes(linkId);
    } else {
      // Show public pages links
      const publicLinks = ['nav-home', 'nav-login', 'nav-signup', 'nav-settings'];
      shouldShow = publicLinks.includes(linkId);
    }
    
    // Show or hide the link
    link.style.display = shouldShow ? 'inline-block' : 'none';
  });
}

/**
 * Set the active navigation link based on current page
 */
function setActiveNavLink(currentPage, basePath) {
  const navLinks = document.querySelectorAll('#navbar-header nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Remove the basePath to compare just the filename
    const cleanHref = href.replace(basePath, '');
    
    // Check if this is the current page
    if (currentPage === cleanHref || currentPage === cleanHref.split('/').pop()) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Apply navbar styling dynamically
 */
function applyNavbarStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Navbar header styling - inherit from style.css */
    #navbar-header {
      background: #2D3A32 !important;
      color: white !important;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 12px solid #FFB36B !important;
      flex-wrap: wrap;
      gap: 1rem;
      position: relative;
      z-index: 1000;
    }

    #navbar-header .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #navbar-header .logo {
      height: 100px;
      max-width: 100%;
      width: auto;
      border-radius: 8px;
    }

    #navbar-header h1 {
      margin: 0;
      font-size: 1.4rem;
      word-break: break-word;
      color: white !important;
    }

    /* Navigation styling */
    #navbar-header nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    #navbar-header nav a {
      color: black !important;
      text-decoration: none !important;
      font-size: 1rem;
      background: #DCEFD8 !important;
      padding: 0.45rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: inline-block;
      white-space: nowrap;
    }

    #navbar-header nav a:hover {
      filter: hue-rotate(30deg) brightness(0.95);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    /* Active navbar link styling */
    #navbar-header nav a.active {
      background: #FFB36B !important;
      color: black !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 12px rgba(255, 179, 107, 0.4) !important;
    }

    /* Responsive header */
    @media (max-width: 768px) {
      #navbar-header {
        padding: 0.8rem 1rem;
        flex-direction: column;
        text-align: center;
        gap: 0.8rem;
      }

      #navbar-header .header-left {
        flex-direction: column;
        gap: 0.5rem;
      }

      #navbar-header h1 {
        font-size: 1.2rem;
      }

      #navbar-header .logo {
        height: 80px;
      }

      #navbar-header nav {
        justify-content: center;
      }

      #navbar-header nav a {
        font-size: 0.9rem;
        padding: 0.4rem 0.8rem;
      }
    }

    @media (max-width: 480px) {
      #navbar-header {
        padding: 0.6rem 0.8rem;
        gap: 0.5rem;
        border-bottom-width: 8px;
      }

      #navbar-header .header-left {
        width: 100%;
      }

      #navbar-header h1 {
        font-size: 1rem;
      }

      #navbar-header .logo {
        height: 50px;
      }

      #navbar-header nav {
        width: 100%;
        justify-content: center;
        gap: 0.4rem;
      }

      #navbar-header nav a {
        font-size: 0.8rem;
        padding: 0.3rem 0.6rem;
        border-radius: 15px;
      }
    }
  `;
  document.head.appendChild(style);
}

