import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../index.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Lê o código gigante da URL
  
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!token) {
      setError('Link inválido ou ausente.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setMessage('Senha alterada com sucesso! A redirecionar...');
      setTimeout(() => navigate('/login'), 3000); // Manda para o login após 3 segundos
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Criar Nova Senha</h2>
        
        {message ? (
           <div style={{ textAlign: 'center' }}>
             <p style={{ color: 'green', fontSize: '18px', margin: '20px 0' }}>✅ {message}</p>
             <Link to="/login" className="btn-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>Ir para o Login</Link>
           </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            
            <div className="form-group">
              <label>Nova Senha</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="No mínimo 6 caracteres"
                required 
                minLength="6"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'A guardar...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}