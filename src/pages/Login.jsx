import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import '../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      // O Backend retorna: { token: "...", role: "TENANT" ou "STUDENT" }
      const { token, role } = response.data;

      // Salva no navegador para usar nas próximas requisições
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      // Salva o email diretamente do formulário (não depende da resposta do backend)
      localStorage.setItem('userEmail', email);

      toast.success('Login realizado com sucesso!');

      // Redirecionamento inteligente por role
      setTimeout(() => {
        if (role === 'TENANT') {
          navigate('/dashboard');
        } else if (role === 'STUDENT') {
          navigate('/student-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 500);

    } catch (err) {
      const msg = err.response?.data?.error || 'E-mail ou senha inválidos. Tente novamente.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <h1>💪 Fitness B2B</h1>
          <p>Faça login para continuar</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            É Personal e não tem conta? <Link to="/register">Crie agora</Link>
          </p>
          <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
            * Alunos devem usar o link de convite enviado pelo seu Personal.
          </p>
        </div>
      </div>
    </div>
  );
}