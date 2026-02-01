/**
 * Gallery Lightbox
 * Click image to open, ESC to close, arrow keys for prev/next
 * Scroll lock while open, close on backdrop click
 */

(function() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const closeButton = document.querySelector('.lightbox-close');
  const prevButton = document.querySelector('.lightbox-prev');
  const nextButton = document.querySelector('.lightbox-next');
  const backdrop = document.querySelector('.lightbox-backdrop');
  const galleryImages = document.querySelectorAll('.gallery-image');

  if (!lightbox || galleryImages.length === 0) {
    return;
  }

  let currentIndex = 0;

  // Open lightbox
  function openLightbox(index) {
    currentIndex = index;
    const image = galleryImages[index];
    const fullPath = image.getAttribute('data-full');

    lightboxImage.src = fullPath;
    lightboxImage.alt = image.alt;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Scroll lock

    // Update button states
    updateButtons();
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = ''; // Remove scroll lock
    lightboxImage.src = '';
  }

  // Navigate to previous image
  function showPrevious() {
    if (currentIndex > 0) {
      openLightbox(currentIndex - 1);
    }
  }

  // Navigate to next image
  function showNext() {
    if (currentIndex < galleryImages.length - 1) {
      openLightbox(currentIndex + 1);
    }
  }

  // Update button visibility
  function updateButtons() {
    prevButton.style.display = currentIndex > 0 ? 'block' : 'none';
    nextButton.style.display = currentIndex < galleryImages.length - 1 ? 'block' : 'none';
  }

  // Keyboard navigation
  function handleKeydown(e) {
    if (lightbox.style.display === 'none') return;

    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrevious();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  }

  // Event listeners
  galleryImages.forEach((image, index) => {
    image.addEventListener('click', () => openLightbox(index));
  });

  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', showPrevious);
  nextButton.addEventListener('click', showNext);
  backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', handleKeydown);
})();
