# Themefisher Quick Order - Chrome Extension

A Chrome extension for placing orders in just 2-3 clicks!

## Features

✨ **Quick Ordering**
- Place orders in 2-3 clicks from anywhere
- Browse full menu in a compact popup
- Save favorite orders for ultra-fast reordering

☕ **Smart Favorites**
- Save frequently ordered items
- One-click quick order with saved preferences
- Manage favorites directly from the extension

🔔 **Notifications**
- Get desktop notifications for order confirmation
- View order status without leaving your current tab

🔐 **Secure**
- Uses your existing Themefisher account
- Encrypted token storage
- No sensitive data stored locally

## Installation

### Method 1: From ZIP File (Easiest)

1. Download the `chrome-extension.zip` file
2. Extract it to a folder (e.g., `~/themefisher-extension`)
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (top right toggle)
5. Click "Load unpacked"
6. Select the extracted extension folder
7. Done! The extension is now installed

### Method 2: Manual Setup

1. Go to the `chrome-extension/` folder in the project
2. Copy all files to a folder on your computer
3. Follow steps 3-7 from Method 1 above

## Quick Start

### First Time Setup

1. Click the extension icon (☕) in your Chrome toolbar
2. Click "Open App to Login" to authenticate with Themefisher
3. Login with your email and password
4. Return to the extension - it's now ready to use!

### Placing an Order

**2-Click Order (Using Favorites):**
1. Click extension icon
2. Click a favorite item → Order placed instantly!

**3-Click Order (Custom Selection):**
1. Click extension icon
2. Select items from the menu
3. Click "Place Order" → Done!

## How to Use

### Quick Order with Favorites
- If you order the same items regularly, save them as favorites
- Next time, place the order in just 2 clicks
- Click the extension → Click favorite → Order placed!

### Browse & Order
1. Click the extension icon
2. Browse all menu items in the "All Items" section
3. Click items to select (you can add multiple quantities)
4. Click "Place Order" button
5. Order confirmation shows immediately

### Manage Favorites
- While browsing the menu, click an item to add it to your cart
- After placing an order, it's automatically saved to favorites
- Click a favorite button again to modify the quantity before ordering

### View Menu
- Click "🔍 Browse Menu" to open the full web app
- This lets you see detailed descriptions and images

## Keyboard Shortcuts

- **Ctrl+Shift+O** (Windows) or **Cmd+Shift+O** (Mac): Open extension popup
- **Enter**: Place quick order
- **Esc**: Close popup

## Features in Detail

### Status Indicators
- **🟢 Green**: Order placed successfully
- **🔵 Blue**: Loading/Processing
- **🔴 Red**: Error occurred

### Order History
View your recent orders by clicking "🔍 Browse Menu" and going to "My Orders"

### Quick Stats
The extension shows:
- Number of items in your current order
- Order total (calculated)
- Estimated delivery time

## Troubleshooting

### Extension not showing notifications
**Solution**: Check if notifications are enabled for Chrome:
1. Click the 🔒 icon next to the URL
2. Check "Notifications" is set to "Allow"

### "Not authenticated" message
**Solution**: You need to login:
1. Click "Open App to Login"
2. Login with your Themefisher credentials
3. Return to the extension

### Can't load menu items
**Solution**: Try these steps:
1. Go to `chrome://extensions/`
2. Find "Themefisher Quick Order"
3. Click the reload icon (⟳)
4. Click the extension icon again

### Order not placing
**Solution**: Check your connection:
1. Make sure you're connected to the internet
2. Try opening https://tf-office-service.vercel.app in a new tab
3. If that works, try the extension again
4. If not, there may be a server issue - try again in a few minutes

## Settings & Data

### Stored Data
The extension stores only:
- Your authentication token (encrypted)
- Saved favorites list
- Recent orders (optional)

**No passwords are stored locally.**

### Clear Data
To clear all stored data:
1. Go to `chrome://extensions/`
2. Find "Themefisher Quick Order"
3. Click "Remove" to uninstall
4. Click the extension again to reinstall (clears all data)

Or manually:
1. Go to Settings → Privacy and security → Delete browsing data
2. Select "All time" timeframe
3. Check "Cookies and other site data"
4. Click "Delete data"

## Updates

The extension will auto-update from Chrome Web Store (when published).

To check for updates:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click ⟳ (refresh) on the extension

## Support & Feedback

**Issues?** 
- Check the troubleshooting section above
- Contact: support@themefisher.com
- Or create an issue on GitHub

**Feature requests?**
- Submit feedback through the extension settings
- Or email: feature-requests@themefisher.com

## Privacy Policy

This extension:
- ✅ Only stores essential data (auth token, favorites)
- ✅ Never shares your data with third parties
- ✅ Doesn't track your browsing
- ✅ All communication is encrypted (HTTPS)

See full privacy policy: https://themefisher.com/privacy

## License

© 2026 Themefisher. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: 2026-06-08  
**Chrome Version Required**: 88+
