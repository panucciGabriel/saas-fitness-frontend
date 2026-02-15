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

// (Opcional) Interceptor para adicionar o Token automaticamente se você usar Login depois
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Ou onde você salva o token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;