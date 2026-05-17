// Demo file with intentional bugs for PR Buddy testing
// Create a PR with this file to see PR Buddy in action!

/**
 * Calculate total price with tax
 * BUG: Off-by-one error in loop
 */
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {  // BUG: Should be i < items.length
    total += items[i].price;
  }
  return total;
}

/**
 * Process payment for a user
 * SECURITY: SQL injection vulnerability
 * BUG: No null check
 */
function processPayment(amount, userId) {
  // SECURITY: SQL injection - should use parameterized queries
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  
  // BUG: No null/undefined check
  const user = getUser(userId);
  console.log(user.name);  // Will crash if user is null
  
  // STYLE: Magic number without explanation
  return amount * 1.1;
}

/**
 * Validate email address
 * BUG: Weak regex, doesn't handle edge cases
 */
function validateEmail(email) {
  // BUG: This regex is too simple and has issues
  return email.includes('@');  // Should use proper regex
}

/**
 * Get user by ID
 * BUG: No error handling
 */
async function getUser(userId) {
  // BUG: No try-catch, no error handling
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

/**
 * Format currency
 * STYLE: Inconsistent formatting
 */
function formatCurrency(amount) {
  // STYLE: Should use Intl.NumberFormat
  return '$' + amount.toFixed(2);
}

/**
 * Check if user is admin
 * SECURITY: Weak authentication check
 */
function isAdmin(user) {
  // SECURITY: Should check against secure backend, not client-side property
  return user.role === 'admin';
}

/**
 * Delete user account
 * SECURITY: No authorization check
 * BUG: No confirmation
 */
async function deleteAccount(userId) {
  // SECURITY: Should verify user has permission to delete this account
  // BUG: No confirmation dialog or safety check
  await fetch(`/api/users/${userId}`, { method: 'DELETE' });
}

/**
 * Parse JSON data
 * BUG: No error handling for invalid JSON
 */
function parseData(jsonString) {
  // BUG: Will throw if jsonString is invalid JSON
  return JSON.parse(jsonString);
}

/**
 * Calculate discount
 * BUG: Division by zero possible
 */
function calculateDiscount(price, discountPercent) {
  // BUG: No validation, could divide by zero or get negative values
  return price - (price * discountPercent / 100);
}

/**
 * Store sensitive data
 * SECURITY: Storing password in localStorage
 */
function saveCredentials(username, password) {
  // SECURITY: Never store passwords in localStorage!
  localStorage.setItem('username', username);
  localStorage.setItem('password', password);  // CRITICAL SECURITY ISSUE
}

function processPayment(userId, amount) {
  // SQL Injection vulnerability
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  const user = db.query(query);
  
  // Missing error handling
  const result = paymentAPI.charge(amount);
  return result;
}

// Untested function
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

// MISSING: No tests for any of these functions!
// PR Buddy should suggest test stubs for all of them

module.exports = {
  calculateTotal,
  processPayment,
  validateEmail,
  getUser,
  formatCurrency,
  isAdmin,
  deleteAccount,
  parseData,
  calculateDiscount,
  saveCredentials
};

// Made with Bob
