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
      localStorage.setItem('userEmail', email);

      toast.success('Login realizado com sucesso!');

      // Redirecionamento inteligente por role
      setTimeout(() => {
        if (role === 'TENANT') {
          navigate('/dashboard'); // Painel do Personal
        } else if (role === 'STUDENT') {
          navigate('/student-dashboard'); // Painel do Aluno
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
          <h1>💪 App Fitness</h1>
          {/* MUDANÇA 1: Texto mais inclusivo para os dois públicos */}
          <p>Acesse seu painel (Personal ou Aluno)</p>
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
          {/* MUDANÇA 2: Deixando claro que a criação de conta aqui é SÓ para o Personal */}
          <p>
            <strong>Personal Trainer:</strong> Não tem conta? <Link to="/register">Crie sua academia</Link>
          </p>
          <p style={{ fontSize: '12px', marginTop: '10px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            * <strong>Alunos:</strong> O primeiro acesso deve ser feito pelo link de matrícula enviado pelo seu treinador.
          </p>
        </div>
      </div>
    </div>
  );
}