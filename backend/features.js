document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeNav = document.querySelector('.close-nav');

    if (hamburger && mobileNav) {
        // Toggle mobile navigation
        hamburger.addEventListener('click', () => {
            const isActive = mobileNav.classList.contains('active');
            mobileNav.classList.toggle('active');
            hamburger.classList.toggle('active', !isActive); // Sync hamburger state
            document.body.style.overflow = isActive ? '' : 'hidden'; // Prevent scrolling when menu is open
        });

        // Close mobile navigation
        if (closeNav) {
            closeNav.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active'); // Reset hamburger state
                document.body.style.overflow = ''; // Restore scrolling
            });
        }
    }

    // Close mobile navigation when clicking outside
    document.addEventListener('click', (e) => {
        if (
            !mobileNav.contains(e.target) &&
            !hamburger.contains(e.target) &&
            mobileNav.classList.contains('active')
        ) {
            mobileNav.classList.remove('active');
            hamburger.classList.remove('active'); // Reset hamburger state
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Feature sections animation with Intersection Observer
    const observerOptions = {
        root: null,
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const featureSections = document.querySelectorAll('.feature');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    featureSections.forEach(section => {
        observer.observe(section);
    });
    
    // Testimonial slider functionality
    const testimonialTrack = document.querySelector('.testimonial-track');
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.prev-testimonial');
    const nextButton = document.querySelector('.next-testimonial');
    
    let currentIndex = 0;
    const slideWidth = 100; // 100%
    
    // Initialize the slider
    function updateSlider() {
        if (testimonialTrack) {
            testimonialTrack.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
            
            // Update active dot
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
    }
    
    // Event listeners for controls
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : testimonialSlides.length - 1;
            updateSlider();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex < testimonialSlides.length - 1) ? currentIndex + 1 : 0;
            updateSlider();
        });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
        });
    });
    
    // Auto-advance the slider every 5 seconds
    let slideInterval = setInterval(() => {
        currentIndex = (currentIndex < testimonialSlides.length - 1) ? currentIndex + 1 : 0;
        updateSlider();
    }, 5000);
    
    // Pause auto-advance on hover
    if (testimonialTrack) {
        testimonialTrack.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        testimonialTrack.addEventListener('mouseleave', () => {
            slideInterval = setInterval(() => {
                currentIndex = (currentIndex < testimonialSlides.length - 1) ? currentIndex + 1 : 0;
                updateSlider();
            }, 5000);
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (hamburger?.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    mobileNav.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Scroll to the target element
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add hover effect to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Initialize the testimonial slider on page load
    updateSlider();

    // Menu icon toggle functionality
    const menuIcon = document.getElementById('menuIcon');
    const navMenu = document.getElementById('navMenu');

    menuIcon.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        menuIcon.classList.toggle('open');
    });
});
