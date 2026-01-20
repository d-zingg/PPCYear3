/**
 * UsersContext - React Context wrapper for OOAD User Management
 * Integrates DatabaseManager service with React state management
 */

import React, { createContext, useState, useEffect } from 'react'
import { DatabaseManager, RegistrationService, ValidationService } from '../services'

export const UsersContext = createContext()

export function UsersProvider({ children }) {
  // Initialize OOAD services
  const databaseManager = DatabaseManager.getInstance()
  const registrationService = RegistrationService.getInstance()
  const validationService = ValidationService.getInstance()

  // Load users from database manager
  const [allUsers, setAllUsers] = useState(() => {
    return databaseManager.getAllUsers()
  })

  // Sync with database when users change
  useEffect(() => {
    databaseManager.saveAllUsers(allUsers)
  }, [allUsers])

  /**
   * OOAD-based Add User
   * Uses DatabaseManager and RegistrationService
   */
  const addUser = (userData) => {
    // Use registration service for proper validation
    const result = registrationService.register(userData)
    
    if (result.success) {
      // Reload all users from database
      const updatedUsers = databaseManager.getAllUsers()
      setAllUsers(updatedUsers)
      return result.user
    }

    throw new Error(result.message || 'Failed to add user')
  }

  /**
   * OOAD-based Remove User
   * Uses DatabaseManager
   */
  const removeUser = (userId) => {
    const result = databaseManager.deleteUser(userId)
    
    if (result.success) {
      const updatedUsers = databaseManager.getAllUsers()
      setAllUsers(updatedUsers)
      return result
    }

    throw new Error(result.message || 'Failed to remove user')
  }

  /**
   * OOAD-based Update User
   * Uses DatabaseManager
   */
  const updateUser = (userId, updatedData) => {
    const result = databaseManager.updateUser(userId, updatedData)
    
    if (result.success) {
      const updatedUsers = databaseManager.getAllUsers()
      setAllUsers(updatedUsers)
      return result.user
    }

    throw new Error(result.message || 'Failed to update user')
  }

  /**
   * Get users by role using DatabaseManager
   */
  const getUsersByRole = (role) => {
    return databaseManager.findUsersByRole(role)
  }

  /**
   * Get user by email using DatabaseManager
   */
  const getUserByEmail = (email) => {
    return databaseManager.findUserByEmail(email)
  }

  /**
   * Get user by ID using DatabaseManager
   */
  const getUserById = (userId) => {
    return databaseManager.findUserById(userId)
  }

  /**
   * Check if email is available
   */
  const isEmailAvailable = (email) => {
    return registrationService.checkEmailAvailability(email)
  }

  /**
   * Validate user data
   */
  const validateUser = (userData) => {
    return validationService.validateRegistrationData(userData)
  }

  /**
   * Refresh users from database
   */
  const refreshUsers = () => {
    const users = databaseManager.getAllUsers()
    setAllUsers(users)
    return users
  }

  /**
   * Get user statistics
   */
  const getUserStats = () => {
    return {
      total: allUsers.length,
      admins: getUsersByRole('admin').length,
      teachers: getUsersByRole('teacher').length,
      students: getUsersByRole('student').length
    }
  }

  const value = {
    // State
    allUsers,
    
    // CRUD Operations (OOAD-based)
    addUser,
    removeUser,
    updateUser,
    refreshUsers,
    
    // Query Operations
    getUsersByRole,
    getUserByEmail,
    getUserById,
    
    // Validation
    isEmailAvailable,
    validateUser,
    
    // Statistics
    getUserStats,
    
    // Service Access
    services: {
      database: databaseManager,
      registration: registrationService,
      validation: validationService
    }
  }

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  )
}

