import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import '../index.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      setLoading(false);
      return;
    }

    // Validação de senha mínima
    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      toast.error('Senha muito curta!');
      setLoading(false);
      return;
    }

    // Validação de confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem!');
      toast.error('As senhas não coincidem!');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'STUDENT'
      };

      await api.post('/auth/register', dataToSend);

      toast.success('Cadastro realizado com sucesso!');

      // Pequeno delay para mostrar o toast antes de redirecionar
      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (err) {
      console.error('Erro no registro:', err);
      const msg = err.response?.data?.message || 'Erro ao conectar com o servidor. Tente novamente.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <Toaster position="top-right" />
      <div className="register-content">
        <h2>Crie sua Conta</h2>
        <p>Preencha os dados abaixo para começar.</p>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Seu nome"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha (mínimo 6 caracteres)</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="******"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="******"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Carregando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Já tem uma conta? <Link to="/login">Faça Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}