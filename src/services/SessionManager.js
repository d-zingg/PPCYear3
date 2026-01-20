/**
 * OOAD Implementation: SessionManager
 * Responsible for managing user sessions
 * Handles session creation, validation, and termination
 */

import DatabaseManager from './DatabaseManager';
import AuthenticationService from './AuthenticationService';

class SessionManager {
  /**
   * Singleton instance
   */
  static instance = null;

  constructor() {
    if (SessionManager.instance) {
      return SessionManager.instance;
    }

    this.databaseManager = DatabaseManager.getInstance();
    this.authenticationService = null; // Will be set lazily to avoid circular dependency
    this.currentSession = null;
    this.sessionTimeout = 60 * 60 * 1000; // 1 hour in milliseconds

    SessionManager.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Get authentication service instance (lazy loading to avoid circular dependency)
   */
  getAuthService() {
    if (!this.authenticationService) {
      this.authenticationService = AuthenticationService.getInstance();
    }
    return this.authenticationService;
  }

  /**
   * Create new session for user
   * @param {Object} userData - User data
   * @returns {Object} Session creation result
   */
  createSession(userData) {
    try {
      const session = {
        userId: userData.userId || userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        profileImage: userData.profileImage,
        schoolName: userData.schoolName,
        sessionId: this.generateSessionId(),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString()
      };

      // Save to storage
      const saveResult = this.databaseManager.saveCurrentUser(session);

      if (saveResult.success) {
        this.currentSession = session;

        // Also save role separately for quick access
        try {
          localStorage.setItem('ppc_role', session.role);
        } catch (e) {
          console.error('Failed to save role:', e);
        }

        return {
          success: true,
          session,
          message: 'Session created successfully'
        };
      }

      return {
        success: false,
        message: 'Failed to save session',
        error: saveResult.error
      };

    } catch (error) {
      return {
        success: false,
        message: 'Session creation failed',
        error: error.message
      };
    }
  }

  /**
   * Get current active session
   * @returns {Object|null} Current session or null
   */
  getCurrentSession() {
    if (this.currentSession) {
      // Check if session is still valid
      if (this.isSessionValid(this.currentSession)) {
        return this.currentSession;
      } else {
        // Session expired, clear it
        this.destroySession();
        return null;
      }
    }

    // Try to load from storage
    const storedSession = this.databaseManager.getCurrentUser();
    
    if (storedSession && this.isSessionValid(storedSession)) {
      this.currentSession = storedSession;
      return storedSession;
    }

    return null;
  }

  /**
   * Check if session is valid
   * @param {Object} session - Session data
   * @returns {boolean} True if valid
   */
  isSessionValid(session) {
    if (!session || !session.expiresAt) {
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    return now < expiresAt;
  }

  /**
   * Update session activity timestamp
   * @returns {Object} Update result
   */
  updateActivity() {
    const session = this.getCurrentSession();

    if (!session) {
      return {
        success: false,
        message: 'No active session'
      };
    }

    session.lastActivity = new Date().toISOString();
    session.expiresAt = new Date(Date.now() + this.sessionTimeout).toISOString();

    this.databaseManager.saveCurrentUser(session);
    this.currentSession = session;

    return {
      success: true,
      session
    };
  }

  /**
   * Update session data
   * @param {Object} updatedData - Updated session data
   * @returns {Object} Update result
   */
  updateSession(updatedData) {
    const session = this.getCurrentSession();

    if (!session) {
      return {
        success: false,
        message: 'No active session'
      };
    }

    const updatedSession = {
      ...session,
      ...updatedData,
      lastActivity: new Date().toISOString()
    };

    const saveResult = this.databaseManager.saveCurrentUser(updatedSession);

    if (saveResult.success) {
      this.currentSession = updatedSession;

      // Update user in database as well
      this.databaseManager.updateUser(session.userId, updatedData);

      return {
        success: true,
        session: updatedSession,
        message: 'Session updated successfully'
      };
    }

    return saveResult;
  }

  /**
   * Destroy current session (logout)
   * @returns {Object} Destruction result
   */
  destroySession() {
    try {
      // Clear from storage
      this.databaseManager.clearCurrentUser();

      // Clear role
      try {
        localStorage.removeItem('ppc_role');
      } catch (e) {
        console.error('Failed to remove role:', e);
      }

      // Clear in-memory session
      this.currentSession = null;

      return {
        success: true,
        message: 'Session destroyed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to destroy session',
        error: error.message
      };
    }
  }

  /**
   * Validate current session
   * @returns {Object} Validation result
   */
  validateSession() {
    const session = this.getCurrentSession();

    if (!session) {
      return {
        valid: false,
        message: 'No active session',
        reason: 'NO_SESSION'
      };
    }

    if (!this.isSessionValid(session)) {
      this.destroySession();
      return {
        valid: false,
        message: 'Session has expired',
        reason: 'EXPIRED'
      };
    }

    // Verify with authentication service
    const authService = this.getAuthService();
    const verification = authService.verifySession(session);

    if (!verification.valid) {
      this.destroySession();
      return {
        valid: false,
        message: verification.message,
        reason: 'VERIFICATION_FAILED'
      };
    }

    // Update activity timestamp
    this.updateActivity();

    return {
      valid: true,
      session,
      message: 'Session is valid'
    };
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get session duration in minutes
   * @returns {number} Duration in minutes
   */
  getSessionDuration() {
    return this.sessionTimeout / (60 * 1000);
  }

  /**
   * Extend session timeout
   * @param {number} additionalMinutes - Minutes to add to session
   * @returns {Object} Extension result
   */
  extendSession(additionalMinutes) {
    const session = this.getCurrentSession();

    if (!session) {
      return {
        success: false,
        message: 'No active session'
      };
    }

    const additionalTime = additionalMinutes * 60 * 1000;
    const newExpiresAt = new Date(Date.now() + this.sessionTimeout + additionalTime);

    session.expiresAt = newExpiresAt.toISOString();
    this.databaseManager.saveCurrentUser(session);
    this.currentSession = session;

    return {
      success: true,
      session,
      message: `Session extended by ${additionalMinutes} minutes`,
      newExpiresAt: newExpiresAt.toISOString()
    };
  }

  /**
   * Get time until session expires
   * @returns {Object} Time remaining
   */
  getTimeUntilExpiry() {
    const session = this.getCurrentSession();

    if (!session) {
      return {
        expired: true,
        minutes: 0,
        message: 'No active session'
      };
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const timeRemaining = expiresAt - now;

    if (timeRemaining <= 0) {
      return {
        expired: true,
        minutes: 0,
        message: 'Session has expired'
      };
    }

    return {
      expired: false,
      minutes: Math.floor(timeRemaining / (60 * 1000)),
      seconds: Math.floor((timeRemaining % (60 * 1000)) / 1000),
      message: 'Session is active'
    };
  }
}

export default SessionManager;
