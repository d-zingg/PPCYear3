/**
 * OOAD Implementation: User Model (Abstract Base Class)
 * Represents the core User entity in the system
 * Following Object-Oriented Analysis and Design principles
 */

/**
 * Abstract User Class
 * Defines the common attributes and behaviors for all system users
 */
class User {
  constructor(userId, username, password, email, role, additionalData = {}) {
    if (this.constructor === User) {
      throw new Error("Cannot instantiate abstract class User directly");
    }
    
    this.userId = userId;
    this.username = username;
    this.password = password; // In production, this should be hashed
    this.email = email;
    this.role = role;
    this.name = additionalData.name || username;
    this.schoolName = additionalData.schoolName || '';
    this.phone = additionalData.phone || '';
    this.dob = additionalData.dob || null;
    this.profileImage = additionalData.profileImage || null;
    this.createdAt = additionalData.createdAt || new Date();
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  login() {
    throw new Error("login() method must be implemented by subclass");
  }

  /**
   * Common logout functionality for all users
   */
  logout() {
    return {
      success: true,
      message: `${this.role} logged out successfully`,
      userId: this.userId
    };
  }

  /**
   * Update user profile information
   * @param {Object} updatedData - The data to update
   * @returns {Object} Updated user object
   */
  updateProfile(updatedData) {
    Object.keys(updatedData).forEach(key => {
      if (key !== 'userId' && key !== 'role' && this.hasOwnProperty(key)) {
        this[key] = updatedData[key];
      }
    });
    return this.toJSON();
  }

  /**
   * Get user permissions based on role
   * Abstract method - must be implemented by subclasses
   */
  getPermissions() {
    throw new Error("getPermissions() method must be implemented by subclass");
  }

  /**
   * Validate user data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    
    if (!this.username || this.username.trim() === '') {
      errors.push('Username is required');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }
    
    if (!this.password || this.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Email validation helper
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Convert user object to JSON (for storage/transmission)
   */
  toJSON() {
    return {
      userId: this.userId,
      username: this.username,
      email: this.email,
      role: this.role,
      name: this.name,
      schoolName: this.schoolName,
      phone: this.phone,
      dob: this.dob,
      profileImage: this.profileImage,
      createdAt: this.createdAt
    };
  }

  /**
   * Get display name for UI
   */
  getDisplayName() {
    return this.name || this.username;
  }
}

export default User;
