/**
 * OOAD Implementation: RegistrationService
 * Responsible for new user registration
 * Handles user creation and initial data setup
 */

import Admin from '../models/Admin';
import Teacher from '../models/Teacher';
import Student from '../models/Student';
import ValidationService from './ValidationService';
import DatabaseManager from './DatabaseManager';

class RegistrationService {
  /**
   * Singleton instance
   */
  static instance = null;

  constructor() {
    if (RegistrationService.instance) {
      return RegistrationService.instance;
    }

    this.validationService = ValidationService.getInstance();
    this.databaseManager = DatabaseManager.getInstance();

    RegistrationService.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!RegistrationService.instance) {
      RegistrationService.instance = new RegistrationService();
    }
    return RegistrationService.instance;
  }

  /**
   * Register a new user
   * @param {Object} userData - Registration data
   * @returns {Object} Registration result
   */
  register(userData) {
    // Step 1: Validate and sanitize input data
    const validation = this.validationService.validateAndSanitize(userData);

    if (!validation.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
        step: 'validation'
      };
    }

    const sanitizedData = validation.data;

    // Step 2: Check if user already exists
    const existingUser = this.databaseManager.findUserByEmail(sanitizedData.email);

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists',
        error: 'DUPLICATE_EMAIL',
        step: 'duplicate_check'
      };
    }

    // Step 3: Generate unique user ID
    const userId = this.generateUserId();

    // Step 4: Create user instance based on role
    try {
      const userInstance = this.createUserInstance(
        userId,
        sanitizedData
      );

      // Step 5: Validate user object
      const userValidation = userInstance.validate();
      if (!userValidation.isValid) {
        return {
          success: false,
          message: 'User validation failed',
          errors: userValidation.errors,
          step: 'user_validation'
        };
      }

      // Step 6: Prepare user data for storage
      const userDataForStorage = {
        ...userInstance.toJSON(),
        password: sanitizedData.password, // Store password (should be hashed in production)
        username: sanitizedData.username || sanitizedData.name,
        createdAt: new Date().toISOString()
      };

      // Step 7: Persist user to database
      const dbResult = this.databaseManager.addUser(userDataForStorage);

      if (!dbResult.success) {
        return {
          success: false,
          message: dbResult.message,
          error: dbResult.error,
          step: 'database_insert'
        };
      }

      // Step 8: Return successful registration
      return {
        success: true,
        message: `${sanitizedData.role} account created successfully`,
        user: dbResult.user,
        userId: userId,
        role: sanitizedData.role,
        redirectTo: this.getRedirectPath(sanitizedData.role),
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        message: 'Registration failed',
        error: error.message,
        step: 'user_creation'
      };
    }
  }

  /**
   * Create user instance based on role
   * @param {string} userId - Generated user ID
   * @param {Object} userData - User registration data
   * @returns {Object} User instance (Admin, Teacher, or Student)
   */
  createUserInstance(userId, userData) {
    const { username, name, email, password, role } = userData;
    const displayName = username || name;

    switch (role) {
      case 'admin':
        return new Admin(userId, displayName, password, email, userData);
      case 'teacher':
        return new Teacher(userId, displayName, password, email, userData);
      case 'student':
        return new Student(userId, displayName, password, email, userData);
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }

  /**
   * Generate unique user ID
   * @returns {string} Unique user ID
   */
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get redirect path based on role
   * @param {string} role - User role
   * @returns {string} Redirect path
   */
  getRedirectPath(role) {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      default:
        return '/';
    }
  }

  /**
   * Validate registration step data
   * @param {number} step - Current registration step
   * @param {Object} stepData - Data for current step
   * @returns {Object} Validation result
   */
  validateStep(step, stepData) {
    switch (step) {
      case 0: // Account type selection
        return this.validationService.validateRole(stepData.role);

      case 1: // Basic information
        return {
          isValid: stepData.name && stepData.name.trim() !== '',
          message: stepData.name ? 'Valid name' : 'Name is required'
        };

      case 2: // School and contact
        return {
          isValid: stepData.schoolName && stepData.schoolName.trim() !== '',
          message: stepData.schoolName ? 'Valid school name' : 'School name is required'
        };

      case 3: // Email
        return this.validationService.validateEmail(stepData.email);

      case 4: // Password
        const passwordValidation = this.validationService.validatePassword(stepData.password);
        if (!passwordValidation.isValid) {
          return passwordValidation;
        }

        if (stepData.confirmPassword) {
          return this.validationService.validatePasswordMatch(
            stepData.password,
            stepData.confirmPassword
          );
        }

        return passwordValidation;

      default:
        return {
          isValid: true,
          message: 'Step validation passed'
        };
    }
  }

  /**
   * Check if email is available
   * @param {string} email - Email to check
   * @returns {Object} Availability result
   */
  checkEmailAvailability(email) {
    const emailValidation = this.validationService.validateEmail(email);

    if (!emailValidation.isValid) {
      return {
        available: false,
        message: emailValidation.message,
        reason: 'INVALID_FORMAT'
      };
    }

    const existingUser = this.databaseManager.findUserByEmail(email);

    return {
      available: !existingUser,
      message: existingUser 
        ? 'Email is already registered' 
        : 'Email is available',
      reason: existingUser ? 'DUPLICATE' : null
    };
  }

  /**
   * Get registration progress percentage
   * @param {number} currentStep - Current step number
   * @param {number} totalSteps - Total number of steps
   * @returns {number} Progress percentage
   */
  getProgress(currentStep, totalSteps) {
    return Math.round((currentStep / totalSteps) * 100);
  }

  /**
   * Get registration requirements
   * @returns {Object} Registration requirements
   */
  getRequirements() {
    return {
      username: {
        minLength: 3,
        pattern: 'Letters, numbers, and underscores only',
        required: true
      },
      email: {
        pattern: 'Valid email format (user@example.com)',
        required: true
      },
      password: {
        minLength: 6,
        requirements: ['At least 6 characters', 'At least one letter'],
        required: true
      },
      role: {
        options: ['admin', 'teacher', 'student'],
        required: true
      },
      phone: {
        pattern: 'Numbers, spaces, dashes, and parentheses',
        required: false
      },
      schoolName: {
        required: true
      }
    };
  }
}

export default RegistrationService;
