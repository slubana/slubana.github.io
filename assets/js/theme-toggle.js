/**
 * Theme Toggle
 * Handles switching between light and dark themes
 * Persists preference to localStorage
 */

(function() {
  const toggleButton = document.getElementById('theme-toggle');

  if (!toggleButton) {
    console.warn('Theme toggle button not found');
    return;
  }

  // Toggle theme on button click
  toggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Update DOM
    document.documentElement.setAttribute('data-theme', newTheme);

    // Persist to localStorage
    localStorage.setItem('theme', newTheme);
  });
})();
