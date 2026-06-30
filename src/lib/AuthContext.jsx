import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check local storage for persistent session
    const stored = localStorage.getItem('drago_auth')
    if (stored) {
      setCurrentUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const saveSession = (user) => {
    setCurrentUser(user)
    if (user) {
      localStorage.setItem('drago_auth', JSON.stringify(user))
    } else {
      localStorage.removeItem('drago_auth')
    }
  }

  const login = async (username, password) => {
    // Hardcoded admin check
    if (username === 'admin@drago.com' && password === 'admin123') {
      const adminUser = {
        id: 'admin_1',
        username: 'admin@drago.com',
        role: 'admin',
        profileCompleted: true // admin doesn't need profile
      }
      saveSession(adminUser)
      return { user: adminUser }
    }

    // Regular user check
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !data) {
      throw new Error('Invalid username or password')
    }

    if (data.password !== password) {
      throw new Error('Invalid username or password')
    }

    // Check if profile is completed
    const profileCompleted = !!(data.name && data.email && data.mobile)
    
    const userObj = {
      id: data.id,
      username: data.username,
      role: data.role,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      profileCompleted
    }
    saveSession(userObj)
    return { user: userObj }
  }

  const register = async (username, password) => {
    if (!/^[a-zA-Z0-9@._]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, @, ., and _')
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      throw new Error('Username already exists')
    }

    // Create user
    const { data, error } = await supabase
      .from('app_users')
      .insert({
        username,
        password, // Warning: plain text for prototype only!
        role: 'user'
      })
      .select()
      .single()

    if (error) throw error

    const userObj = {
      id: data.id,
      username: data.username,
      role: data.role,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      profileCompleted: false
    }
    saveSession(userObj)
    return { user: userObj }
  }

  const updateProfile = async (profileData) => {
    if (!currentUser || currentUser.role === 'admin') return

    const { error } = await supabase
      .from('app_users')
      .update({
        name: profileData.name,
        email: profileData.email,
        mobile: profileData.mobile
      })
      .eq('id', currentUser.id)

    if (error) throw error

    const updatedUser = {
      ...currentUser,
      ...profileData,
      profileCompleted: true
    }
    saveSession(updatedUser)
  }

  const logout = () => {
    saveSession(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
