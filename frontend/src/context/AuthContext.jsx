import { createContext, useContext } from 'react'
import useUserStore from '../store/userStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const user = useUserStore(state => state.user)
    const loading = useUserStore(state => state.loading)
    const login = useUserStore(state => state.login)
    const register = useUserStore(state => state.register)
    const logout = useUserStore(state => state.logout)
    const refreshUser = useUserStore(state => state.refreshUser)

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
