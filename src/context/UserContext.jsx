import React, { createContext, useState, useEffect } from 'react'

export const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('ppc_user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      try { localStorage.setItem('ppc_user', JSON.stringify(user)) } catch (e) {}
      if (user.role) {
        try { localStorage.setItem('ppc_role', user.role) } catch (e) {}
      }
    }
  }, [user])

  const signIn = (userData) => {
    setUser(userData)
    try { localStorage.setItem('ppc_user', JSON.stringify(userData)) } catch (e) {}
    if (userData && userData.role) {
      try { localStorage.setItem('ppc_role', userData.role) } catch (e) {}
    }
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    try { localStorage.setItem('ppc_user', JSON.stringify(newUser)) } catch (e) {}
    if (newUser.role) {
      try { localStorage.setItem('ppc_role', newUser.role) } catch (e) {}
    }
  }

  const signOut = () => {
    setUser(null)
    try { localStorage.removeItem('ppc_user') } catch (e) {}
    try { localStorage.removeItem('ppc_role') } catch (e) {}
  }

  return (
    <UserContext.Provider value={{ user, signIn, signOut, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}
