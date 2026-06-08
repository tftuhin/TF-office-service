// Background service worker for Chrome extension
// Handles authentication and cross-tab communication

chrome.runtime.onInstalled.addListener(() => {
  console.log('Themefisher Quick Order extension installed');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSession') {
    chrome.storage.sync.get(['authToken', 'userId'], (data) => {
      sendResponse({
        token: data.authToken,
        userId: data.userId
      });
    });
    return true;
  }

  if (request.action === 'saveSession') {
    chrome.storage.sync.set({
      authToken: request.token,
      userId: request.userId
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'clearSession') {
    chrome.storage.sync.remove(['authToken', 'userId'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Update badge when order is placed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    chrome.action.setBadge({
      text: '✓',
      title: 'Order placed!'
    });

    setTimeout(() => {
      chrome.action.setBadge({ text: '' });
    }, 5000);
  }
});
