/**
 * OOAD Implementation: Admin Class
 * Extends User base class with administrator-specific functionality
 * Responsibilities: System management, user management, configuration
 */

import User from './User';

/**
 * Admin Class - Represents system administrators
 * Inherits from User base class
 */
class Admin extends User {
  constructor(userId, username, password, email, additionalData = {}) {
    super(userId, username, password, email, 'admin', additionalData);
    this.managedUsers = []; // Track users managed by this admin
    this.systemConfig = {}; // System configuration access
  }

  /**
   * Implement abstract login method from User class
   * @returns {Object} Login result with admin-specific data
   */
  login() {
    return {
      success: true,
      role: this.role,
      user: this.toJSON(),
      redirectTo: '/admin',
      permissions: this.getPermissions(),
      message: `Administrator ${this.username} logged in successfully`
    };
  }

  /**
   * Get admin-specific permissions
   * @returns {Array} List of permissions
   */
  getPermissions() {
    return [
      'manage_users',
      'create_user',
      'update_user',
      'delete_user',
      'manage_data',
      'view_all_data',
      'configure_system',
      'view_reports',
      'manage_schools',
      'manage_classes',
      'manage_assignments',
      'full_access'
    ];
  }

  /**
   * Admin Use Case: Manage Users
   * @param {string} action - 'create', 'update', 'delete', 'view'
   * @param {Object} userData - User data for the action
   * @returns {Object} Action result
   */
  manageUsers(action, userData = null) {
    if (!this.getPermissions().includes('manage_users')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      action,
      performedBy: this.userId,
      userData,
      timestamp: new Date()
    };
  }

  /**
   * Admin Use Case: Manage System Data
   * @param {string} dataType - Type of data to manage
   * @param {string} operation - 'create', 'read', 'update', 'delete'
   * @param {Object} data - Data for the operation
   * @returns {Object} Operation result
   */
  manageData(dataType, operation, data = null) {
    if (!this.getPermissions().includes('manage_data')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      dataType,
      operation,
      data,
      performedBy: this.userId,
      timestamp: new Date()
    };
  }

  /**
   * Admin Use Case: Configure System Settings
   * @param {string} configKey - Configuration key
   * @param {any} configValue - Configuration value
   * @returns {Object} Configuration result
   */
  configureSystem(configKey, configValue) {
    if (!this.getPermissions().includes('configure_system')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    this.systemConfig[configKey] = configValue;
    
    return {
      success: true,
      configKey,
      configValue,
      performedBy: this.userId,
      timestamp: new Date()
    };
  }

  /**
   * Admin Use Case: View System Reports
   * @param {string} reportType - Type of report to view
   * @returns {Object} Report data
   */
  viewReports(reportType) {
    if (!this.getPermissions().includes('view_reports')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      reportType,
      requestedBy: this.userId,
      timestamp: new Date()
    };
  }

  /**
   * Admin Use Case: Manage Class Members
   * Add or remove teachers and students from classes
   * @param {string} classId - The class identifier
   * @param {string} action - 'add_teacher', 'remove_teacher', 'add_student', 'remove_student'
   * @param {string} userId - The user ID to add/remove
   * @returns {Object} Operation result
   */
  manageClassMembers(classId, action, userId) {
    if (!this.getPermissions().includes('manage_classes')) {
      return {
        success: false,
        message: 'Insufficient permissions to manage class members'
      };
    }

    const validActions = ['add_teacher', 'remove_teacher', 'add_student', 'remove_student'];
    if (!validActions.includes(action)) {
      return {
        success: false,
        message: 'Invalid action specified'
      };
    }

    return {
      success: true,
      classId,
      action,
      userId,
      performedBy: this.userId,
      timestamp: new Date(),
      message: `Successfully performed ${action} for user ${userId} in class ${classId}`
    };
  }

  /**
   * Override toJSON to include admin-specific data
   */
  toJSON() {
    return {
      ...super.toJSON(),
      managedUsersCount: this.managedUsers.length,
      hasSystemAccess: true
    };
  }
}

export default Admin;
