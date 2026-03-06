import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('tech4u_user')
        return saved ? JSON.parse(saved) : null
    })
    const [loading, setLoading] = useState(false)

    const login = async (email, password) => {
        setLoading(true)
        try {
            const res = await api.post('/auth/login', { email, password })
            const { access_token, user: userData } = res.data
            localStorage.setItem('tech4u_token', access_token)
            localStorage.setItem('tech4u_user', JSON.stringify(userData))
            setUser(userData)
            return userData
        } finally {
            setLoading(false)
        }
    }

    const register = async (nombre, email, password, referralCode = null, subscriptionType = 'free') => {
        setLoading(true)
        try {
            const res = await api.post('/auth/register', {
                nombre,
                email,
                password,
                subscription_type: subscriptionType,
                referral_code: referralCode
            })
            const { access_token, user: userData } = res.data
            localStorage.setItem('tech4u_token', access_token)
            localStorage.setItem('tech4u_user', JSON.stringify(userData))
            setUser(userData)
            return userData
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('tech4u_token')
        localStorage.removeItem('tech4u_user')
        setUser(null)
    }

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/me')
            const updatedUser = res.data
            localStorage.setItem('tech4u_user', JSON.stringify(updatedUser))
            setUser(updatedUser)
            return updatedUser
        } catch (err) {
            console.error('Error refreshing user:', err)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
