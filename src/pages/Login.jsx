import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../index.css';
import { GoogleLogin } from '@react-oauth/google'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- LOGIN TRADICIONAL (E-mail e Senha) ---
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      if (response.data.role === 'TENANT') navigate('/dashboard');
      else if (response.data.role === 'STUDENT') navigate('/student-dashboard');
      else navigate('/');
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  }

  // --- LOGIN COM GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      // Envia o token gigante do Google para a nossa API em Java
      const response = await api.post('/auth/google', { 
        token: credentialResponse.credential 
      });
      
      // O Java aprovou! Guardamos o token do SaaS e entramos
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      if (response.data.role === 'TENANT') navigate('/dashboard');
      else if (response.data.role === 'STUDENT') navigate('/student-dashboard');
      
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Conta não encontrada. Por favor, cadastre-se primeiro.');
      } else {
        setError('Falha ao autenticar com o Google no servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Entrar no Sistema</h2>
        {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        {/* Formulário Tradicional */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            
            {/* 🌟 NOVO: LINK DE RECUPERAÇÃO DE SENHA AQUI */}
            <div style={{ textAlign: 'right', marginTop: '5px' }}>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>
                Esqueceu a senha?
              </Link>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Divisor Visual */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <hr style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
          <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '14px' }}>ou</span>
          <hr style={{ flex: 1, borderTop: '1px solid #e5e7eb' }} />
        </div>

        {/* Botão Oficial do Google */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Erro ao conectar com o Google. Tente novamente.');
            }}
          />
        </div>

        <div className="login-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Não tem uma conta? <Link to="/register">Crie uma Academia</Link></p>
        </div>
      </div>
    </div>
  );
}