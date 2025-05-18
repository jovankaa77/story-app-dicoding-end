const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const Auth = {
  /**
   * Save the authentication token to localStorage.
   * @param {string} token - The token to be stored.
   */
  saveToken(token) {
    this._setItem(TOKEN_KEY, token);
  },

  /**
   * Retrieve the authentication token from localStorage.
   * @returns {string|null} The stored token or null if not found.
   */
  getToken() {
    return this._getItem(TOKEN_KEY);
  },

  /**
   * Clear the authentication token from localStorage.
   */
  clearToken() {
    this._removeItem(TOKEN_KEY);
  },

  /**
   * Save user data to localStorage.
   * @param {Object} user - The user data to be stored.
   */
  saveUser(user) {
    this._setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Retrieve user data from localStorage.
   * @returns {Object|null} The parsed user data or null if not found.
   */
  getUser() {
    const user = this._getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Clear user data from localStorage.
   */
  clearUser() {
    this._removeItem(USER_KEY);
  },

  /**
   * Helper function to safely set an item in localStorage.
   * @param {string} key - The key to store the item under.
   * @param {string} value - The value to be stored.
   */
  _setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed: ${key}`, error);
    }
  },

  /**
   * Helper function to safely retrieve an item from localStorage.
   * @param {string} key - The key to retrieve the item by.
   * @returns {string|null} The retrieved value or null if not found.
   */
  _getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed: ${key}`, error);
      return null;
    }
  },

  /**
   * Helper function to safely remove an item from localStorage.
   * @param {string} key - The key of the item to be removed.
   */
  _removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed: ${key}`, error);
    }
  },
};

export default Auth;
