/**
 * OOAD Implementation: DatabaseManager
 * Responsible for data persistence and retrieval
 * Implements abstraction layer for data storage (currently using localStorage)
 */

class DatabaseManager {
  /**
   * Singleton instance
   */
  static instance = null;

  constructor() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance;
    }
    
    this.storagePrefix = 'ppc_';
    this.tables = {
      users: 'all_users',
      currentUser: 'user',
      sessions: 'sessions',
      classes: 'classes',
      assignments: 'assignments',
      posts: 'posts'
    };
    
    DatabaseManager.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Get storage key with prefix
   * @param {string} key - Storage key
   * @returns {string} Prefixed key
   */
  getKey(key) {
    return `${this.storagePrefix}${key}`;
  }

  /**
   * Save data to storage
   * @param {string} table - Table/collection name
   * @param {any} data - Data to save
   * @returns {Object} Operation result
   */
  save(table, data) {
    try {
      const key = this.getKey(table);
      const jsonData = JSON.stringify(data);
      localStorage.setItem(key, jsonData);
      
      return {
        success: true,
        table,
        message: 'Data saved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        table,
        error: error.message,
        message: 'Failed to save data'
      };
    }
  }

  /**
   * Load data from storage
   * @param {string} table - Table/collection name
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Retrieved data or default value
   */
  load(table, defaultValue = null) {
    try {
      const key = this.getKey(table);
      const jsonData = localStorage.getItem(key);
      
      if (!jsonData) {
        return defaultValue;
      }
      
      return JSON.parse(jsonData);
    } catch (error) {
      console.error(`Failed to load data from ${table}:`, error);
      return defaultValue;
    }
  }

  /**
   * Delete data from storage
   * @param {string} table - Table/collection name
   * @returns {Object} Operation result
   */
  delete(table) {
    try {
      const key = this.getKey(table);
      localStorage.removeItem(key);
      
      return {
        success: true,
        table,
        message: 'Data deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        table,
        error: error.message,
        message: 'Failed to delete data'
      };
    }
  }

  /**
   * Check if data exists in storage
   * @param {string} table - Table/collection name
   * @returns {boolean} True if exists
   */
  exists(table) {
    const key = this.getKey(table);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all users from database
   * @returns {Array} Array of users
   */
  getAllUsers() {
    return this.load(this.tables.users, []);
  }

  /**
   * Save all users to database
   * @param {Array} users - Array of users
   * @returns {Object} Operation result
   */
  saveAllUsers(users) {
    return this.save(this.tables.users, users);
  }

  /**
   * Find user by ID
   * @param {string|number} userId - User ID
   * @returns {Object|null} User object or null
   */
  findUserById(userId) {
    const users = this.getAllUsers();
    return users.find(user => user.userId === userId || user.id === userId) || null;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  findUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @returns {Array} Array of users with specified role
   */
  findUsersByRole(role) {
    const users = this.getAllUsers();
    return users.filter(user => user.role === role);
  }

  /**
   * Add new user to database
   * @param {Object} userData - User data
   * @returns {Object} Operation result with user data
   */
  addUser(userData) {
    try {
      const users = this.getAllUsers();
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
          error: 'DUPLICATE_USER'
        };
      }

      const newUser = {
        ...userData,
        id: userData.userId || Date.now(),
        userId: userData.userId || Date.now(),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      const result = this.saveAllUsers(users);

      if (result.success) {
        return {
          success: true,
          user: newUser,
          message: 'User added successfully'
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add user'
      };
    }
  }

  /**
   * Update user in database
   * @param {string|number} userId - User ID
   * @param {Object} updatedData - Updated user data
   * @returns {Object} Operation result
   */
  updateUser(userId, updatedData) {
    try {
      const users = this.getAllUsers();
      const index = users.findIndex(u => u.userId === userId || u.id === userId || u.email === userId);

      if (index === -1) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        };
      }

      users[index] = { ...users[index], ...updatedData };
      const result = this.saveAllUsers(users);

      if (result.success) {
        return {
          success: true,
          user: users[index],
          message: 'User updated successfully'
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update user'
      };
    }
  }

  /**
   * Delete user from database
   * @param {string|number} userId - User ID
   * @returns {Object} Operation result
   */
  deleteUser(userId) {
    try {
      const users = this.getAllUsers();
      const filtered = users.filter(u => u.userId !== userId && u.id !== userId && u.email !== userId);

      if (filtered.length === users.length) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        };
      }

      const result = this.saveAllUsers(filtered);

      if (result.success) {
        return {
          success: true,
          message: 'User deleted successfully'
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete user'
      };
    }
  }

  /**
   * Save current user session
   * @param {Object} userData - Current user data
   * @returns {Object} Operation result
   */
  saveCurrentUser(userData) {
    return this.save(this.tables.currentUser, userData);
  }

  /**
   * Get current user session
   * @returns {Object|null} Current user or null
   */
  getCurrentUser() {
    return this.load(this.tables.currentUser, null);
  }

  /**
   * Clear current user session
   * @returns {Object} Operation result
   */
  clearCurrentUser() {
    return this.delete(this.tables.currentUser);
  }

  /**
   * Clear all data (for testing/reset)
   * @returns {Object} Operation result
   */
  clearAll() {
    try {
      Object.values(this.tables).forEach(table => {
        this.delete(table);
      });
      
      return {
        success: true,
        message: 'All data cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to clear all data'
      };
    }
  }
}

export default DatabaseManager;
