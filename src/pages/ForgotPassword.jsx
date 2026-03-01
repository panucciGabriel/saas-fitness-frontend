import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../index.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Se o e-mail existir, receberá um link de recuperação.');
      setEmail('');
    } catch (err) {
      setError('Erro ao solicitar recuperação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Recuperar Senha</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '20px' }}>
          Digite o seu e-mail e enviaremos um link para redefinir a sua senha.
        </p>

        {message && <p style={{ color: 'green', textAlign: 'center', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '5px' }}>✅ {message}</p>}
        {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com"
              required 
            />
          </div>
          <button type="submit" disabled={loading || message} className="btn-submit">
            {loading ? 'A enviar...' : 'Enviar Link'}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p><Link to="/login">Voltar para o Login</Link></p>
        </div>
      </div>
    </div>
  );
}