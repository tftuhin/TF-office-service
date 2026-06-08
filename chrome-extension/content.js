// Content script - runs on the Themefisher app
// Helps the extension access authentication tokens

console.log('[Themefisher] Content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Themefisher] Received message:', request.action);

  if (request.action === 'getToken') {
    // Get auth data from localStorage
    try {
      const token = localStorage.getItem('auth_token');
      const userId = localStorage.getItem('user_id');
      const email = localStorage.getItem('user_email');

      console.log('[Themefisher] Token check:', { token: !!token, userId: !!userId });

      if (token && userId) {
        sendResponse({
          token: token,
          userId: userId,
          email: email || ''
        });
      } else {
        sendResponse({ error: 'Not authenticated' });
      }
    } catch (error) {
      console.error('[Themefisher] Error getting token:', error);
      sendResponse({ error: error.message });
    }
    return true; // Keep channel open for async response
  }
});

// Auto-send token on page load if it exists
function sendTokenIfAvailable() {
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');
  const email = localStorage.getItem('user_email');

  if (token && userId) {
    console.log('[Themefisher] Sending token to extension...');
    try {
      chrome.runtime.sendMessage({
        action: 'tokenUpdated',
        token: token,
        userId: userId,
        email: email || ''
      });
    } catch (error) {
      console.log('[Themefisher] Extension not available (expected if not installed)');
    }
  }
}

// Send token on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', sendTokenIfAvailable);
} else {
  sendTokenIfAvailable();
}

// Also send when storage changes (user logs in)
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token' && event.newValue) {
    console.log('[Themefisher] Auth token updated, notifying extension...');
    sendTokenIfAvailable();
  }
});
