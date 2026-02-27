import axios from 'axios'

const API_BASE = 'http://localhost:8000'

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
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
        if (err.response?.status === 401) {
            localStorage.removeItem('tech4u_token')
            localStorage.removeItem('tech4u_user')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
