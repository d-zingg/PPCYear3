/**
 * OOAD Implementation: AuthenticationService
 * Responsible for user authentication and credential verification
 * Implements security and access control
 */

import Admin from '../models/Admin';
import Teacher from '../models/Teacher';
import Student from '../models/Student';
import ValidationService from './ValidationService';
import DatabaseManager from './DatabaseManager';

class AuthenticationService {
  /**
   * Singleton instance
   */
  static instance = null;

  constructor() {
    if (AuthenticationService.instance) {
      return AuthenticationService.instance;
    }

    this.validationService = ValidationService.getInstance();
    this.databaseManager = DatabaseManager.getInstance();
    this.maxLoginAttempts = 5;
    this.loginAttempts = {};

    AuthenticationService.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Create appropriate user object based on role
   * @param {Object} userData - User data from database
   * @returns {Object} User instance (Admin, Teacher, or Student)
   */
  createUserInstance(userData) {
    const { userId, username, password, email, role } = userData;

    switch (role) {
      case 'admin':
        return new Admin(userId, username, password, email, userData);
      case 'teacher':
        return new Teacher(userId, username, password, email, userData);
      case 'student':
        return new Student(userId, username, password, email, userData);
      default:
        throw new Error(`Invalid user role: ${role}`);
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - Expected user role
   * @returns {Object} Authentication result
   */
  authenticate(email, password, role) {
    // Step 1: Validate credentials format
    const validation = this.validationService.validateLoginCredentials(
      email,
      password,
      role
    );

    if (!validation.isValid) {
      return {
        success: false,
        message: 'Invalid credentials format',
        errors: validation.errors
      };
    }

    // Step 2: Check login attempts
    const attemptCheck = this.checkLoginAttempts(email);
    if (!attemptCheck.allowed) {
      return {
        success: false,
        message: attemptCheck.message,
        locked: true
      };
    }

    // Step 3: Find user in database
    const user = this.databaseManager.findUserByEmail(email);

    if (!user) {
      this.recordFailedAttempt(email);
      return {
        success: false,
        message: 'User not found with this email',
        error: 'USER_NOT_FOUND'
      };
    }

    // Step 4: Verify role matches
    if (user.role !== role) {
      this.recordFailedAttempt(email);
      return {
        success: false,
        message: `Account is not registered as ${role}`,
        error: 'ROLE_MISMATCH'
      };
    }

    // Step 5: Verify password
    // Note: In production, use bcrypt or similar for password hashing
    if (user.password !== password) {
      this.recordFailedAttempt(email);
      return {
        success: false,
        message: 'Incorrect password',
        error: 'INVALID_PASSWORD'
      };
    }

    // Step 6: Create user instance and perform login
    try {
      const userInstance = this.createUserInstance(user);
      const loginResult = userInstance.login();

      // Clear failed attempts on successful login
      this.clearLoginAttempts(email);

      // Return successful authentication
      return {
        ...loginResult,
        userInstance,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Authentication failed',
        error: error.message
      };
    }
  }

  /**
   * Check if user has exceeded login attempts
   * @param {string} email - User email
   * @returns {Object} Check result
   */
  checkLoginAttempts(email) {
    const attempts = this.loginAttempts[email] || { count: 0, lastAttempt: null };

    if (attempts.count >= this.maxLoginAttempts) {
      const lockoutTime = 15 * 60 * 1000; // 15 minutes
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;

      if (timeSinceLastAttempt < lockoutTime) {
        const remainingMinutes = Math.ceil((lockoutTime - timeSinceLastAttempt) / 60000);
        return {
          allowed: false,
          message: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`
        };
      } else {
        // Reset after lockout period
        this.clearLoginAttempts(email);
      }
    }

    return {
      allowed: true,
      remainingAttempts: this.maxLoginAttempts - attempts.count
    };
  }

  /**
   * Record failed login attempt
   * @param {string} email - User email
   */
  recordFailedAttempt(email) {
    if (!this.loginAttempts[email]) {
      this.loginAttempts[email] = { count: 0, lastAttempt: null };
    }

    this.loginAttempts[email].count++;
    this.loginAttempts[email].lastAttempt = Date.now();
  }

  /**
   * Clear login attempts for user
   * @param {string} email - User email
   */
  clearLoginAttempts(email) {
    delete this.loginAttempts[email];
  }

  /**
   * Verify user session
   * @param {Object} userData - User session data
   * @returns {Object} Verification result
   */
  verifySession(userData) {
    if (!userData || !userData.userId) {
      return {
        valid: false,
        message: 'No active session'
      };
    }

    const user = this.databaseManager.findUserById(userData.userId);

    if (!user) {
      return {
        valid: false,
        message: 'Session user not found'
      };
    }

    return {
      valid: true,
      user,
      message: 'Session is valid'
    };
  }

  /**
   * Logout user
   * @param {Object} userData - User data
   * @returns {Object} Logout result
   */
  logout(userData) {
    if (!userData) {
      return {
        success: false,
        message: 'No user to logout'
      };
    }

    try {
      const userInstance = this.createUserInstance(userData);
      return userInstance.logout();
    } catch (error) {
      return {
        success: true, // Still allow logout even if instance creation fails
        message: 'Logged out',
        error: error.message
      };
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Change result
   */
  changePassword(userId, oldPassword, newPassword) {
    const user = this.databaseManager.findUserById(userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
    }

    if (user.password !== oldPassword) {
      return {
        success: false,
        message: 'Current password is incorrect',
        error: 'INVALID_PASSWORD'
      };
    }

    const validation = this.validationService.validatePassword(newPassword);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'New password does not meet requirements',
        errors: validation.errors
      };
    }

    const updateResult = this.databaseManager.updateUser(userId, {
      password: newPassword
    });

    return updateResult;
  }

  /**
   * Reset password (admin function)
   * @param {string} email - User email
   * @param {string} newPassword - New password
   * @returns {Object} Reset result
   */
  resetPassword(email, newPassword) {
    const user = this.databaseManager.findUserByEmail(email);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
    }

    const validation = this.validationService.validatePassword(newPassword);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Password does not meet requirements',
        errors: validation.errors
      };
    }

    const updateResult = this.databaseManager.updateUser(user.userId, {
      password: newPassword
    });

    return updateResult;
  }
}

export default AuthenticationService;
