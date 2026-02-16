import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Importando a configuração correta da API

// --- ATENÇÃO AQUI ---
// Se o seu arquivo de estilo tiver outro nome, altere esta linha!
// Exemplo: import './Register.css'; ou import '../App.css';
import '../index.css';
// --------------------

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '' // Adicionei confirmação de senha (opcional, mas bom ter)
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

    // Validação simples de senha
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem!');
      setLoading(false);
      return;
    }

    try {
      // Prepara os dados para enviar (removemos o confirmPassword pois o backend não precisa dele)
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'STUDENT' // Se seu backend exigir role, mantenha. Se não, pode apagar.
      };

      // AQUI É O PULO DO GATO: Usando 'api' em vez de 'axios' direto
      await api.post('/auth/register', dataToSend);
      
      alert('Cadastro realizado com sucesso! Faça login.');
      navigate('/login'); // Redireciona para o login
      
    } catch (err) {
      console.error('Erro no registro:', err);
      // Tenta pegar a mensagem de erro bonita do backend
      const msg = err.response?.data?.message || 'Erro ao conectar com o servidor. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
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
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="******"
              value={formData.password}
              onChange={handleChange}
              required
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