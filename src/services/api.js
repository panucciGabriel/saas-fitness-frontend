import axios from 'axios';

// A MÁGICA:
// Se estiver na Vercel, ele pega a variável de ambiente VITE_API_URL.
// Se estiver no seu computador, ele usa http://localhost:8080.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de REQUEST: Adiciona o Token automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de RESPONSE: Trata erros 401 globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token inválido ou expirado
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;