import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('tech4u_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// On 401 → clear token and redirect to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const isAuthRequest = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register')
        if (err.response?.status === 401 && !isAuthRequest) {
            api.post('/auth/logout').catch(() => {})
            localStorage.removeItem('tech4u_token')
            localStorage.removeItem('tech4u_user')
            window.location.href = '/login'
        }
        if (err.response?.status === 429) {
            alert('⚠️ Demasiadas peticiones. Por favor, espera un momento para evitar saturar el sistema.')
        }
        return Promise.reject(err)
    }
)

export default api
