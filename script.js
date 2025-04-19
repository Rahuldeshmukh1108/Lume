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
  
  /**
   * Initialize typewriter effect for tagline
   */
  function initTypewriter() {
    const typewriterElement = document.getElementById("typewriter");
    const text = "Own Your Uniqueness, Rule the World";
    let i = 0;
    const speed = 100; // Typing speed in milliseconds
  
    function type() {
      if (i < text.length) {
        typewriterElement.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // Reset and repeat after a pause (optional)
        setTimeout(() => {
          typewriterElement.textContent = "";
          i = 0;
          type();
        }, 3000);
      }
    }
  
    // Start the typewriter effect
    type();
  }
  
  /**
   * Initialize image slider with controls
   */
  function initImageSlider() {
    const wrapper = document.querySelector(".wrapper");
    const slides = document.querySelectorAll(".wrapper img");
    const totalSlides = slides.length;
    const dotsContainer = document.querySelector(".slider-dots");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    
    let currentIndex = 0;
    let autoSlideInterval;
  
    // Create dots for each slide
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  
    // Function to go to a specific slide
    function goToSlide(index) {
      currentIndex = index;
      updateSlider();
    }
  
    // Function to go to the next slide
    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateSlider();
    }
  
    // Function to go to the previous slide
    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateSlider();
    }
  
    // Update slider position and active dot
    function updateSlider() {
      wrapper.style.transform = `translateX(-${currentIndex * 25}%)`;
      
      // Update active dot
      document.querySelectorAll(".dot").forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
      
      // Reset auto slide timer
      resetAutoSlide();
    }
  
    // Start auto sliding
    function startAutoSlide() {
      autoSlideInterval = setInterval(nextSlide, 5000);
    }
  
    // Reset auto slide timer
    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }
  
    // Event listeners for controls
    prevBtn.addEventListener("click", prevSlide);
    nextBtn.addEventListener("click", nextSlide);
  
    // Pause auto slide on hover
    wrapper.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
    wrapper.addEventListener("mouseleave", startAutoSlide);
  
    // Start auto sliding
    startAutoSlide();
  }
  
  /**
   * Initialize card hover and click effects
   */
  function initCardEffects() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
      // Add subtle movement on mouse move for 3D effect
      card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        
        // Calculate rotation based on mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        // Apply the transform
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });
      
      // Reset transform on mouse leave
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        setTimeout(() => {
          this.style.transform = '';
        }, 300);
      });
    });
  }