/**
 * Blog Post Back Button Logic
 * If user came from Home or Blog index, back returns them there.
 * If user landed externally, back goes to /blog/
 */

(function() {
  const backButton = document.querySelector('.back-button');

  if (!backButton) {
    return;
  }

  const referrer = document.referrer;
  const currentOrigin = window.location.origin;

  let backUrl = backButton.getAttribute('href'); // Default is /blog/

  // Check if referrer is from same origin
  if (referrer && referrer.startsWith(currentOrigin)) {
    try {
      const referrerUrl = new URL(referrer);
      const referrerPath = referrerUrl.pathname;

      // If came from Home (/) or Blog index (starts with /blog)
      if (referrerPath === '/' || referrerPath.startsWith('/blog')) {
        backUrl = referrerPath;
      }
    } catch (e) {
      // If URL parsing fails, keep default
    }
  }

  // Update the back button href
  backButton.setAttribute('href', backUrl);
})();
