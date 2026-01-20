/**
 * UserContext - React Context wrapper for OOAD Architecture
 * Integrates OOAD service layer with React state management
 */

import React, { createContext, useState, useEffect } from 'react'
import { 
  AuthenticationService, 
  SessionManager, 
  DatabaseManager,
  RegistrationService 
} from '../services'

export const UserContext = createContext()

export function UserProvider({ children }) {
  // Initialize OOAD services (Singleton instances)
  const authService = AuthenticationService.getInstance()
  const sessionManager = SessionManager.getInstance()
  const databaseManager = DatabaseManager.getInstance()
  const registrationService = RegistrationService.getInstance()

  // Load user from session manager
  const [user, setUser] = useState(() => {
    const session = sessionManager.getCurrentSession()
    return session
  })

  // Validate session on mount and periodically
  useEffect(() => {
    const validateCurrentSession = () => {
      const validation = sessionManager.validateSession()
      if (!validation.valid && user) {
        setUser(null)
      }
    }

    validateCurrentSession()

    // Validate session every 5 minutes
    const interval = setInterval(validateCurrentSession, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  /**
   * OOAD-based Sign In
   * Uses AuthenticationService and SessionManager
   */
  const signIn = (email, password, role) => {
    const authResult = authService.authenticate(email, password, role)
    
    if (authResult.success) {
      const sessionResult = sessionManager.createSession(authResult.user)
      
      if (sessionResult.success) {
        setUser(sessionResult.session)
        return {
          success: true,
          user: sessionResult.session,
          redirectTo: authResult.redirectTo,
          permissions: authResult.permissions,
          message: authResult.message
        }
      }
    }

    return authResult
  }

  /**
   * OOAD-based Registration
   * Uses RegistrationService
   */
  const register = (userData) => {
    const regResult = registrationService.register(userData)
    
    if (regResult.success) {
      // Automatically sign in after registration
      const sessionResult = sessionManager.createSession(regResult.user)
      
      if (sessionResult.success) {
        setUser(sessionResult.session)
        return {
          success: true,
          user: sessionResult.session,
          redirectTo: regResult.redirectTo, // Include redirect path
          message: regResult.message
        }
      }
    }

    return regResult
  }

  /**
   * OOAD-based Update User
   * Uses SessionManager and DatabaseManager
   */
  const updateUser = (updatedData) => {
    if (!user) {
      return {
        success: false,
        message: 'No user logged in'
      }
    }

    const updateResult = sessionManager.updateSession(updatedData)
    
    if (updateResult.success) {
      setUser(updateResult.session)
      return {
        success: true,
        user: updateResult.session,
        message: 'Profile updated successfully'
      }
    }

    return updateResult
  }

  /**
   * OOAD-based Sign Out
   * Uses SessionManager and AuthenticationService
   */
  const signOut = () => {
    if (user) {
      authService.logout(user)
    }
    
    sessionManager.destroySession()
    setUser(null)

    return {
      success: true,
      message: 'Logged out successfully'
    }
  }

  /**
   * Get current user permissions
   * Uses OOAD User model
   */
  const getUserPermissions = () => {
    if (!user || !user.role) {
      return []
    }

    try {
      const userInstance = authService.createUserInstance(user)
      return userInstance.getPermissions()
    } catch (error) {
      console.error('Error getting permissions:', error)
      return []
    }
  }

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission) => {
    const permissions = getUserPermissions()
    return permissions.includes(permission)
  }

  /**
   * Get user role-specific instance
   */
  const getUserInstance = () => {
    if (!user) return null
    
    try {
      return authService.createUserInstance(user)
    } catch (error) {
      console.error('Error creating user instance:', error)
      return null
    }
  }

  const value = {
    // State
    user,
    
    // OOAD Methods
    signIn,
    signOut,
    updateUser,
    register,
    
    // Permission Methods
    getUserPermissions,
    hasPermission,
    getUserInstance,
    
    // Session Methods
    getSession: () => sessionManager.getCurrentSession(),
    extendSession: (minutes) => sessionManager.extendSession(minutes),
    getSessionTime: () => sessionManager.getTimeUntilExpiry(),
    
    // Service Access (for advanced usage)
    services: {
      auth: authService,
      session: sessionManager,
      database: databaseManager,
      registration: registrationService
    }
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

