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

    // Dentro de src/pages/Login.jsx

return (
    <div className="login-container">
        {/* Adicionamos esta div para ser o "Cartão Branco" */}
        <div className="login-card"> 
            <h2>Acesse sua Conta</h2>
            <p>Bem-vindo de volta!</p>

            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Senha</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="******"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <div className="register-footer">
                Não tem conta? <a href="/register">Cadastre-se</a>
            </div>
        </div>
    </div>
);
}