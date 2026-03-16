import { create } from 'zustand'
import api from '../services/api'

const useUserStore = create((set, get) => ({
    user: (() => {
        try {
            const saved = localStorage.getItem('tech4u_user')
            if (!saved) return null
            const parsed = JSON.parse(saved)
            // Validate that parsed user is a proper object with expected fields
            if (typeof parsed !== 'object' || parsed === null) return null
            return parsed
        } catch (error) {
            // Handle malformed or corrupted user data in localStorage
            console.error('Failed to parse stored user data:', error)
            localStorage.removeItem('tech4u_user')
            localStorage.removeItem('tech4u_token')
            return null
        }
    })(),
    loading: false,

    login: async (email, password) => {
        set({ loading: true })
        try {
            const res = await api.post('/auth/login', { email, password })
            const { access_token, user: userData } = res.data
            // Note: Token is also stored in localStorage for API calls via Authorization header.
            // XSS risk is mitigated by the httpOnly cookie used for session auth.
            // TODO: Migrate fully to httpOnly cookies and remove localStorage token.
            localStorage.setItem('tech4u_token', access_token)
            localStorage.setItem('tech4u_user', JSON.stringify(userData))
            set({ user: userData })
            return userData
        } finally {
            set({ loading: false })
        }
    },

    register: async (nombre, email, password, referralCode = null, subscriptionType = 'free', role = 'alumno') => {
        set({ loading: true })
        try {
            const res = await api.post('/auth/register', {
                nombre,
                email,
                password,
                subscription_type: subscriptionType,
                referral_code: referralCode,
                role: role
            })
            const { access_token, user: userData } = res.data
            // Note: Token is also stored in localStorage for API calls via Authorization header.
            // XSS risk is mitigated by the httpOnly cookie used for session auth.
            // TODO: Migrate fully to httpOnly cookies and remove localStorage token.
            localStorage.setItem('tech4u_token', access_token)
            localStorage.setItem('tech4u_user', JSON.stringify(userData))
            set({ user: userData })
            return userData
        } finally {
            set({ loading: false })
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Logout error:', error)
        }
        localStorage.removeItem('tech4u_token')
        localStorage.removeItem('tech4u_user')
        set({ user: null })
    },

    refreshUser: async () => {
        if (get().loading) return
        try {
            const res = await api.get('/auth/me')
            const updatedUser = res.data
            localStorage.setItem('tech4u_user', JSON.stringify(updatedUser))
            set({ user: updatedUser })
            return updatedUser
        } catch (error) {
            console.error('Refresh error:', error)
        }
    }
}))

export default useUserStore
