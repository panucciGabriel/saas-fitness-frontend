import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Sempre importe o api

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // AQUI TAMBÉM: Usando api.post
            const response = await api.post('/auth/login', formData);
            
            console.log('Login sucesso:', response.data);

            // Salva o token (se seu backend retornar um token JWT)
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            navigate('/dashboard'); // Redireciona para a área logada
        } catch (err) {
            console.error('Erro no login:', err);
            const msg = err.response?.data?.message || 'Email ou senha inválidos.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <h2>Acesse sua Conta</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <p>Não tem conta? <a href="/register">Cadastre-se</a></p>
        </div>
    );
}