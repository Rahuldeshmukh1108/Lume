document.addEventListener("DOMContentLoaded", function() {
    // Initialize all components
    initNavbar();
    initTypewriter();
    initImageSlider();
    initCardEffects();
  });
  
  /**
   * Initialize navbar functionality
   */
  function initNavbar() {
    const menuIcon = document.getElementById("menuIcon");
    const navMenu = document.getElementById("navMenu");
    const nav = document.querySelector(".nav");
  
    // Toggle mobile menu
    menuIcon.addEventListener("click", function() {
      navMenu.classList.toggle("show");
      menuIcon.classList.toggle("open");
    });
  
    // Navbar scroll effect
    window.addEventListener("scroll", function() {
      if (window.scrollY > 50) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    });
  
    // Close menu when clicking outside
    document.addEventListener("click", function(event) {
      if (!event.target.closest("#menuIcon") && !event.target.closest("#navMenu")) {
        navMenu.classList.remove("show");
        menuIcon.classList.remove("open");
      }
    });
  }
    
    // Animate on scroll functionality
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    // Simple animation on scroll function
    function checkScroll() {
      animatedElements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight * 0.85) {
          element.classList.add('aos-animate');
        }
      });
    }
    
    // Initial check on load
    checkScroll();
    
    // Check on scroll
    window.addEventListener('scroll', checkScroll);
    
    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Simple form validation
        if (!name || !email || !subject || !message) {
          alert('Please fill in all fields');
          return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert('Please enter a valid email address');
          return;
        }
        
        // Here you would normally send the form data to a server
        // For now, we'll just show a success message
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
      });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Add hover effect for team members
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
      member.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
        this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
      });
      
      member.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
      });
    });
  