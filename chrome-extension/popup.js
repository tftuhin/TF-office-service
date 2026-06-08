const API_URL = 'https://tf-office-service.vercel.app';

let selectedItems = [];
let userSession = null;
let menuItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    // Check authentication every time popup opens
    const session = await getSession();
    userSession = session;

    if (!session) {
      showAuthSection();
      // Check for login changes while popup is open
      checkForAuthToken();
      return;
    }

    // Load menu and show content
    await loadMenu();
    await loadFavorites();
    showContentSection();
    setupEventListeners();
  } catch (error) {
    console.error('Init error:', error);
    showStatus('Error loading extension', 'error');
  }
}

// Continuously check if user has logged in by checking app tabs
async function checkForAuthToken() {
  let checkCount = 0;
  const maxChecks = 60; // Check for up to 2 minutes

  const checker = setInterval(async () => {
    checkCount++;

    try {
      // Query all tabs to find app tabs
      const tabs = await chrome.tabs.query({ url: `${API_URL}/*` });

      for (const tab of tabs) {
        try {
          // Try to get token from this tab
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'getToken' });

          if (response && response.token) {
            console.log('Found token in tab, saving...');
            await saveSession(response.token, response.userId, response.email);
            clearInterval(checker);

            // Reload to show logged-in state
            setTimeout(() => window.location.reload(), 500);
            return;
          }
        } catch (error) {
          // Tab doesn't respond, continue checking others
        }
      }
    } catch (error) {
      console.error('Check error:', error);
    }

    // Stop checking after max attempts
    if (checkCount >= maxChecks) {
      clearInterval(checker);
    }
  }, 2000);
}

// Get stored session
async function getSession() {
  const stored = await chrome.storage.sync.get(['authToken', 'userId', 'email']);

  if (stored.authToken && stored.userId) {
    return {
      token: stored.authToken,
      userId: stored.userId,
      email: stored.email
    };
  }

  return null;
}

// Save session
async function saveSession(token, userId, email) {
  await chrome.storage.sync.set({
    authToken: token,
    userId: userId,
    email: email
  });

  userSession = {
    token,
    userId,
    email
  };
}

// Load menu items
async function loadMenu() {
  try {
    if (!userSession || !userSession.token) {
      showStatus('Not authenticated', 'error');
      showAuthSection();
      return;
    }

    const response = await fetch(`${API_URL}/api/menu`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userSession.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // Token is invalid, clear and show auth
      await chrome.storage.sync.remove(['authToken', 'userId', 'email']);
      showStatus('Session expired. Please login again.', 'error');
      showAuthSection();
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to load menu (${response.status})`);
    }

    const data = await response.json();
    menuItems = data.items || [];

    // Render menu items
    const menuContainer = document.getElementById('menuContainer');
    if (menuItems.length === 0) {
      menuContainer.innerHTML = '<p style="grid-column: 1/-1; color: #9ca3af;">No menu items available</p>';
      return;
    }

    menuContainer.innerHTML = menuItems.map(item => `
      <div class="menu-item" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-price">Tk ${item.price}</div>
      </div>
    `).join('');

    // Add click handlers to menu items
    document.querySelectorAll('.menu-item').forEach(element => {
      element.addEventListener('click', () => {
        const id = element.getAttribute('data-id');
        const name = element.getAttribute('data-name');
        const price = parseFloat(element.getAttribute('data-price'));
        toggleItem(id, name, price);
      });
    });
  } catch (error) {
    console.error('Menu load error:', error);
    showStatus('Failed to load menu: ' + error.message, 'error');
  }
}

// Load saved favorites
async function loadFavorites() {
  const stored = await chrome.storage.sync.get(['favorites']);
  const favorites = stored.favorites || [];

  const favContainer = document.getElementById('favoritesContainer');

  if (favorites.length === 0) {
    favContainer.innerHTML = '<p style="grid-column: 1/-1; color: #9ca3af; font-size: 12px;">No favorites yet</p>';
    return;
  }

  favContainer.innerHTML = favorites.map(fav => `
    <button class="favorite-btn" onclick="quickOrder('${fav.name}', ${fav.quantity})">
      <div>${fav.name}</div>
      <div style="font-size: 11px; color: #6b7280;">x${fav.quantity}</div>
    </button>
  `).join('');
}

// Toggle menu item selection
function toggleItem(id, name, price) {
  console.log('toggleItem called:', { id, name, price });

  const existing = selectedItems.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
    console.log('Incremented quantity:', existing.quantity);
  } else {
    selectedItems.push({ id, name, price, quantity: 1 });
    console.log('Added new item to cart');
  }

  console.log('Selected items:', selectedItems);

  // Update UI
  const element = document.querySelector(`[data-id="${id}"]`);
  if (element) {
    element.style.background = '#dbeafe';
    element.style.borderColor = '#1a2b45';
    element.style.boxShadow = '0 0 0 2px #1a2b45';
  }

  updateOrderSummary();
}

function updateOrderSummary() {
  const btn = document.getElementById('placeOrderBtn');
  if (selectedItems.length === 0) {
    btn.textContent = '✅ Place Order';
    btn.disabled = true;
  } else {
    const count = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    btn.textContent = `✅ Place Order (${count} items)`;
    btn.disabled = false;
  }
}

// Quick order with favorite
async function quickOrder(name, quantity) {
  // Find the item from menu to get its ID and price
  const menuItem = menuItems.find(item => item.name === name);

  if (!menuItem) {
    showStatus('Item not found in menu', 'error');
    return;
  }

  selectedItems = [
    {
      id: menuItem.id,
      name: menuItem.name,
      quantity: parseInt(quantity),
      price: menuItem.price
    }
  ];

  await placeOrder();
}

// Place order
async function placeOrder() {
  if (selectedItems.length === 0) {
    showStatus('Select items first', 'error');
    return;
  }

  try {
    showStatus('Placing order...', 'loading');

    const items = selectedItems.map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userSession.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items,
        notes: 'Quick order from Chrome extension'
      })
    });

    if (response.status === 401) {
      showStatus('Session expired. Please login again.', 'error');
      await chrome.storage.sync.remove(['authToken', 'userId', 'email']);
      setTimeout(() => window.location.reload(), 1500);
      return;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to place order');
    }

    const data = await response.json();
    showStatus('✅ Order placed successfully!', 'success');
    selectedItems = [];

    setTimeout(() => {
      showStatus('');
      loadMenu();
      updateOrderSummary();
    }, 2000);
  } catch (error) {
    console.error('Order error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    showStatus('Failed to place order: ' + errorMsg, 'error');
  }
}

// UI Helpers
function showStatus(message, type) {
  const status = document.getElementById('status');
  if (message) {
    status.textContent = message;
    status.className = `status ${type}`;
  } else {
    status.className = 'status';
  }
}

function showAuthSection() {
  document.getElementById('authSection').style.display = 'block';
  document.getElementById('contentSection').style.display = 'none';
}

function showContentSection() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('contentSection').style.display = 'block';
}

// Event Listeners
function setupEventListeners() {
  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

  document.getElementById('openAppBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: API_URL });
  });
}

document.getElementById('loginBtn')?.addEventListener('click', () => {
  chrome.tabs.create({ url: `${API_URL}/login` });
  window.close();
});
