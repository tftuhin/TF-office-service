const API_URL = 'https://tf-office-service.vercel.app';
const SUPABASE_URL = 'https://krxkcvxtlqaobchbyutl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeGtjdnh0bHFhb2JjaGJ5dXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcwNzU2MzgsImV4cCI6MjAzMjY1MTYzOH0.T-gzl1nCgI3GXSdJKq8p2gBqC6Q8N6TmcR7VddWW1Zk';

let selectedItems = [];
let userSession = null;
let menuItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    // Check authentication
    const session = await getSession();
    userSession = session;

    if (!session) {
      showAuthSection();
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

// Get stored session or login
async function getSession() {
  // Check if we have stored token
  const stored = await chrome.storage.sync.get(['authToken', 'userId']);

  if (stored.authToken && stored.userId) {
    return {
      token: stored.authToken,
      userId: stored.userId
    };
  }

  return null;
}

// Load menu items
async function loadMenu() {
  try {
    const response = await fetch(`${API_URL}/api/menu`, {
      headers: {
        'Authorization': `Bearer ${userSession.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to load menu');

    const data = await response.json();
    menuItems = data.items || [];

    // Render menu items
    const menuContainer = document.getElementById('menuContainer');
    menuContainer.innerHTML = menuItems.map(item => `
      <div class="menu-item" data-id="${item.id}" onclick="toggleItem(${item.id}, '${item.name}', ${item.price})">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-price">Tk ${item.price}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Menu load error:', error);
    showStatus('Failed to load menu', 'error');
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
  const existing = selectedItems.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    selectedItems.push({ id, name, price, quantity: 1 });
  }

  // Update UI
  const element = document.querySelector(`[data-id="${id}"]`);
  if (element) {
    element.style.background = '#dbeafe';
    element.style.borderColor = '#1a2b45';
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
  selectedItems = [
    {
      name,
      quantity,
      price: 100 // Default, will be updated from menu
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
        notes: `Quick order from Chrome extension`
      })
    });

    if (!response.ok) throw new Error('Failed to place order');

    showStatus('✅ Order placed successfully!', 'success');
    selectedItems = [];
    setTimeout(() => {
      showStatus('');
      loadMenu();
      updateOrderSummary();
    }, 2000);
  } catch (error) {
    console.error('Order error:', error);
    showStatus('Failed to place order', 'error');
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
