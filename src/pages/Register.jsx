import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import '../index.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', // 🌟 Agora o Personal também vai usar este campo
    age: '',
    password: '',
    confirmPassword: ''
  });

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 

  const [personalName, setPersonalName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verifica o convite ao carregar a página
  useEffect(() => {
    if (token) {
      api.get(`/api/invites/${token}`)
        .then(res => {
          setPersonalName(res.data.personalName);
        })
        .catch(() => {
          setError('Este link de convite é inválido ou expirou.');
        });
    }
  }, [token]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem!');
      setLoading(false);
      return;
    }

    try {
      if (token) {
        // --- FLUXO DE ALUNO (Cadastro Completo) ---
        await api.post('/auth/register-student', {
          token: token,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: formData.age,
          password: formData.password
        });
        alert('Cadastro realizado! Faça login para ver seus treinos.');
      } else {
        // --- FLUXO DE PERSONAL ---
        await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone, // 🌟 NOVO: Enviando o WhatsApp do Personal para o Java
          password: formData.password
        });
        alert('Academia criada com sucesso! Faça login.');
      }

      navigate('/login');
      
    } catch (err) {
      console.error('Erro no registro:', err);
      
      let msg = 'Erro ao realizar cadastro. Verifique os dados ou tente outro e-mail.';
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } 
        else if (err.response.data.error) {
          msg = err.response.data.error; // 🌟 Apanha a mensagem do Java (ex: "WhatsApp já em uso")
        } 
        else if (err.response.data.message) {
          msg = err.response.data.message;
        }
      }
      
      setError(msg);
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-content">
        <h2>{token ? 'Matrícula de Aluno' : 'Criar Conta de Personal'}</h2>
        
        {token && personalName && (
           <p className="invite-info">Você está se matriculando com: <strong>{personalName}</strong></p>
        )}
        
        {!token && <p>Comece a gerenciar seus alunos hoje.</p>}

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" name="name" placeholder="Seu nome" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input type="email" name="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
          </div>

          {/* 🌟 CAMPO DE WHATSAPP (Agora aparece para os dois!) */}
          <div className="form-group">
            <label>Celular / WhatsApp</label>
            <input type="text" name="phone" placeholder="(11) 99999-9999" value={formData.phone} onChange={handleChange} required />
          </div>

          {/* 🌟 CAMPO DE IDADE (Continua a aparecer APENAS para Alunos) */}
          {token && (
            <div className="form-group">
              <label>Idade</label>
              <input type="number" name="age" placeholder="Ex: 25" value={formData.age} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group">
            <label>Senha</label>
            <input type="password" name="password" placeholder="******" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Confirmar Senha</label>
            <input type="password" name="confirmPassword" placeholder="******" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Carregando...' : (token ? 'Confirmar Matrícula' : 'Criar Academia')}
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