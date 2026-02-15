import axios from 'axios';

// O Vite vai buscar a variável de ambiente VITE_API_URL.
// Se não achar (no seu PC), usa localhost.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: apiUrl,
});

export default api;