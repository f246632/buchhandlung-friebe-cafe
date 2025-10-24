/* ============================================
   Gallery & Lightbox for Buchhandlung Friebe
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // Lightbox Functionality
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item');

    let currentImageIndex = 0;
    const images = [];

    // Collect all gallery images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        images.push({
            src: img.src,
            alt: img.alt
        });

        // Add click event to open lightbox
        item.addEventListener('click', function() {
            openLightbox(index);
        });

        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View image: ${img.alt}`);

        item.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Focus management for accessibility
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling

        // Return focus to the gallery item that was clicked
        galleryItems[currentImageIndex].focus();
    }

    function updateLightboxImage() {
        if (images[currentImageIndex]) {
            lightboxImg.src = images[currentImageIndex].src;
            lightboxImg.alt = images[currentImageIndex].alt;

            // Update caption if you want to show it
            const caption = document.querySelector('.lightbox-caption');
            if (caption) {
                caption.textContent = images[currentImageIndex].alt;
            }

            // Add fade-in animation
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.style.opacity = '1';
            }, 50);
        }
    }

    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }

    // Close lightbox events
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Navigation events
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            showPreviousImage();
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            showNextImage();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'block') {
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    showPreviousImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
            }
        }
    });

    // ==========================================
    // Touch/Swipe Support for Mobile
    // ==========================================
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - show next
                showNextImage();
            } else {
                // Swiped right - show previous
                showPreviousImage();
            }
        }
    }

    // ==========================================
    // Gallery Image Preloading
    // ==========================================
    function preloadImages() {
        images.forEach(imageData => {
            const img = new Image();
            img.src = imageData.src;
        });
    }

    // Preload images after a short delay to prioritize initial page load
    setTimeout(preloadImages, 2000);

    // ==========================================
    // Gallery Filter/Sort (Optional Enhancement)
    // ==========================================
    // You can add category filters here if needed
    // Example: Filter by interior, exterior, food, etc.

    // ==========================================
    // Image Loading States
    // ==========================================
    lightboxImg.addEventListener('load', function() {
        this.style.transition = 'opacity 0.3s ease';
    });

    lightboxImg.addEventListener('error', function() {
        console.error('Error loading image:', this.src);
        // You could show a placeholder or error message here
    });

    // ==========================================
    // Accessibility: Trap focus within lightbox
    // ==========================================
    const focusableElements = [lightboxClose, lightboxPrev, lightboxNext];

    lightbox.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else { // Tab
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });

    // ==========================================
    // Gallery Animation on Scroll
    // ==========================================
    const galleryObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100); // Stagger animation
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        galleryObserver.observe(item);
    });

    // ==========================================
    // Pinch to Zoom Support (Mobile)
    // ==========================================
    let initialDistance = 0;
    let currentScale = 1;

    lightboxImg.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            initialDistance = getDistance(e.touches);
        }
    });

    lightboxImg.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches);
            const scale = currentDistance / initialDistance;
            currentScale = Math.min(Math.max(1, scale), 3); // Limit between 1x and 3x
            this.style.transform = `scale(${currentScale})`;
        }
    });

    lightboxImg.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            // Reset zoom when fingers are lifted
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                currentScale = 1;
            }, 300);
        }
    });

    function getDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // ==========================================
    // Console Info
    // ==========================================
    console.log(`%cGallery loaded with ${images.length} images`, 'color: #8B4513; font-weight: bold;');
});
