import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true  // httpOnly cookies are sent automatically with this flag
})

// On 401 → clear user and redirect to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const isAuthRequest = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register')
        if (err.response?.status === 401 && !isAuthRequest) {
            api.post('/auth/logout').catch(() => {})
            localStorage.removeItem('tech4u_user')
            // httpOnly cookie will be cleared by backend on /auth/logout
            window.location.href = '/login'
        }
        if (err.response?.status === 429) {
            alert('⚠️ Demasiadas peticiones. Por favor, espera un momento para evitar saturar el sistema.')
        }
        return Promise.reject(err)
    }
)

export default api
