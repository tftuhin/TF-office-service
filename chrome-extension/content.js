// Content script that runs on the web app
// Helps share authentication token with the extension

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getToken') {
    // Get auth data from localStorage
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    const email = localStorage.getItem('user_email');

    // If we have auth data, send it
    if (token && userId) {
      sendResponse({
        token: token,
        userId: userId,
        email: email
      });
    } else {
      // No auth found
      sendResponse({ error: 'Not authenticated' });
    }
  }

  if (request.action === 'setToken') {
    // Save token from app to localStorage
    localStorage.setItem('auth_token', request.token);
    localStorage.setItem('user_id', request.userId);
    localStorage.setItem('user_email', request.email);

    // Also notify the extension
    chrome.runtime.sendMessage({
      action: 'tokenUpdated',
      token: request.token,
      userId: request.userId,
      email: request.email
    });

    sendResponse({ success: true });
  }
});

// On page load, try to auto-send token if available
window.addEventListener('load', () => {
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');
  const email = localStorage.getItem('user_email');

  if (token && userId) {
    try {
      chrome.runtime.sendMessage({
        action: 'tokenUpdated',
        token: token,
        userId: userId,
        email: email
      });
    } catch (error) {
      // Extension might not be listening
    }
  }
});

// Listen for logout events
document.addEventListener('logoutEvent', () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');

  try {
    chrome.runtime.sendMessage({
      action: 'logout'
    });
  } catch (error) {
    // Extension might not be listening
  }
});
