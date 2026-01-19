import React, { createContext, useState, useEffect } from 'react'

export const UsersContext = createContext()

export function UsersProvider({ children }) {
  const [allUsers, setAllUsers] = useState(() => {
    try {
      const raw = localStorage.getItem('ppc_all_users')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('ppc_all_users', JSON.stringify(allUsers))
    } catch (e) {
      // Ignore errors
    }
  }, [allUsers])

  const addUser = (userData) => {
    const newUser = {
      id: Date.now(),
      createdAt: new Date(),
      name: userData.name,
      email: userData.email,
      role: userData.role, // 'admin', 'teacher', 'student'
      schoolName: userData.schoolName,
      phone: userData.phone,
      dob: userData.dob,
      password: userData.password, // Note: Storing password in plain text is insecure; for demo only
      profileImage: userData.profileImage || null,
      // Additional fields can be added as needed
    }
    setAllUsers(prev => [...prev, newUser])
    return newUser
  }

  const removeUser = (userId) => {
    setAllUsers(prev => prev.filter(user => user.id !== userId))
  }

  const updateUser = (userId, updatedData) => {
    setAllUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updatedData } : user
    ))
  }

  const getUsersByRole = (role) => {
    return allUsers.filter(user => user.role === role)
  }

  const getUserByEmail = (email) => {
    return allUsers.find(user => user.email === email)
  }

  return (
    <UsersContext.Provider value={{
      allUsers,
      addUser,
      removeUser,
      updateUser,
      getUsersByRole,
      getUserByEmail
    }}>
      {children}
    </UsersContext.Provider>
  )
}
