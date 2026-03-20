import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true  // httpOnly cookies are sent automatically with this flag
})

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// On 401 → refresh token or logout
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;
        const isAuthRequest = originalRequest.url?.includes('/auth/login') || 
                              originalRequest.url?.includes('/auth/register') ||
                              originalRequest.url?.includes('/auth/refresh')
        
        if (err.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject})
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                })
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/auth/refresh');
                isRefreshing = false;
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                // If refresh fails, permanent logout
                api.post('/auth/logout').catch(() => {})
                localStorage.removeItem('tech4u_user')
                window.location.href = '/login'
                return Promise.reject(refreshError);
            }
        }
        
        if (err.response?.status === 429) {
            alert('⚠️ Demasiadas peticiones. Por favor, espera un momento para evitar saturar el sistema.')
        }
        return Promise.reject(err)
    }
)

export default api
