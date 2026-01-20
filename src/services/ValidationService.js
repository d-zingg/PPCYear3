/**
 * OOAD Implementation: ValidationService
 * Responsible for validating all user inputs and data
 * Ensures data integrity before persistence
 */

class ValidationService {
  /**
   * Singleton instance
   */
  static instance = null;

  constructor() {
    if (ValidationService.instance) {
      return ValidationService.instance;
    }
    ValidationService.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {Object} Validation result
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    return {
      isValid,
      field: 'email',
      message: isValid ? 'Valid email' : 'Invalid email format'
    };
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePassword(password) {
    const errors = [];

    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (password && password.length > 0 && !/[A-Za-z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }

    return {
      isValid: errors.length === 0,
      field: 'password',
      errors,
      message: errors.length === 0 ? 'Valid password' : errors.join(', ')
    };
  }

  /**
   * Validate password confirmation
   * @param {string} password - Original password
   * @param {string} confirmPassword - Confirmation password
   * @returns {Object} Validation result
   */
  validatePasswordMatch(password, confirmPassword) {
    const isValid = password === confirmPassword;

    return {
      isValid,
      field: 'confirmPassword',
      message: isValid ? 'Passwords match' : 'Passwords do not match'
    };
  }

  /**
   * Validate username
   * @param {string} username - Username to validate
   * @returns {Object} Validation result
   */
  validateUsername(username) {
    const errors = [];

    if (!username || username.trim() === '') {
      errors.push('Username is required');
    }

    if (username && username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    return {
      isValid: errors.length === 0,
      field: 'username',
      errors,
      message: errors.length === 0 ? 'Valid username' : errors.join(', ')
    };
  }

  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate
   * @returns {Object} Validation result
   */
  validatePhone(phone) {
    // Basic phone validation - can be customized based on region
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const isValid = !phone || phone.trim() === '' || phoneRegex.test(phone);

    return {
      isValid,
      field: 'phone',
      message: isValid ? 'Valid phone number' : 'Invalid phone number format'
    };
  }

  /**
   * Validate date of birth
   * @param {string} dob - Date of birth to validate
   * @returns {Object} Validation result
   */
  validateDOB(dob) {
    if (!dob) {
      return {
        isValid: true,
        field: 'dob',
        message: 'Date of birth is optional'
      };
    }

    const date = new Date(dob);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();

    const isValid = date instanceof Date && !isNaN(date) && age >= 0 && age <= 150;

    return {
      isValid,
      field: 'dob',
      message: isValid ? 'Valid date of birth' : 'Invalid date of birth'
    };
  }

  /**
   * Validate user role
   * @param {string} role - Role to validate
   * @returns {Object} Validation result
   */
  validateRole(role) {
    const validRoles = ['admin', 'teacher', 'student'];
    const isValid = validRoles.includes(role);

    return {
      isValid,
      field: 'role',
      message: isValid ? 'Valid role' : `Role must be one of: ${validRoles.join(', ')}`
    };
  }

  /**
   * Validate complete user registration data
   * @param {Object} userData - User data to validate
   * @returns {Object} Comprehensive validation result
   */
  validateRegistrationData(userData) {
    const validations = [
      this.validateUsername(userData.username || userData.name),
      this.validateEmail(userData.email),
      this.validatePassword(userData.password),
      this.validateRole(userData.role),
      this.validatePhone(userData.phone),
      this.validateDOB(userData.dob)
    ];

    if (userData.confirmPassword) {
      validations.push(
        this.validatePasswordMatch(userData.password, userData.confirmPassword)
      );
    }

    const allErrors = validations
      .filter(v => !v.isValid)
      .flatMap(v => v.errors || [v.message]);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      validations,
      message: allErrors.length === 0 
        ? 'All validations passed' 
        : `Validation failed: ${allErrors.join('; ')}`
    };
  }

  /**
   * Validate login credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role
   * @returns {Object} Validation result
   */
  validateLoginCredentials(email, password, role) {
    const validations = [
      this.validateEmail(email),
      this.validatePassword(password),
      this.validateRole(role)
    ];

    const allErrors = validations
      .filter(v => !v.isValid)
      .flatMap(v => v.errors || [v.message]);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      validations,
      message: allErrors.length === 0 
        ? 'Credentials are valid' 
        : 'Invalid credentials format'
    };
  }

  /**
   * Sanitize user input to prevent XSS
   * @param {string} input - Input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate and sanitize all user data
   * @param {Object} userData - User data to validate and sanitize
   * @returns {Object} Validated and sanitized data
   */
  validateAndSanitize(userData) {
    const validation = this.validateRegistrationData(userData);

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: validation.message
      };
    }

    const sanitized = {};
    Object.keys(userData).forEach(key => {
      if (typeof userData[key] === 'string') {
        sanitized[key] = this.sanitizeInput(userData[key]);
      } else {
        sanitized[key] = userData[key];
      }
    });

    return {
      success: true,
      data: sanitized,
      message: 'Data validated and sanitized successfully'
    };
  }
}

export default ValidationService;
