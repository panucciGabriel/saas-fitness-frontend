import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

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

    // Validação de email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        // Validação de email
        if (!isValidEmail(formData.email)) {
            setError('Por favor, insira um email válido.');
            toast.error('Email inválido!');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);

            console.log('Login sucesso:', response.data);

            // Salva o token
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            // Salva email do usuário (opcional, para exibir no dashboard)
            if (response.data.email) {
                localStorage.setItem('userEmail', response.data.email);
            }

            toast.success('Login realizado com sucesso!');

            // Pequeno delay para mostrar o toast antes de redirecionar
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } catch (err) {
            console.error('Erro no login:', err);
            const msg = err.response?.data?.message || 'Email ou senha inválidos.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <Toaster position="top-right" />
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