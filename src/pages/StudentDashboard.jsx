import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../index.css';

export default function StudentDashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyWorkouts();
  }, []);

  const fetchMyWorkouts = async () => {
    try {
      const response = await api.get('/api/workouts/my');
      setWorkouts(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>A carregar os seus treinos...</p>;

  return (
    <div className="mobile-layout">
      {/* CONTEÚDO */}
      <div style={{ padding: '30px 20px' }}>
        <header style={{ marginBottom: '25px' }}>
          <h1 style={{ margin: 0, fontSize: '26px' }}>Meus Treinos</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>A sua ficha atualizada</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {workouts.length > 0 ? (
            workouts.map(workout => (
              <div key={workout.id} className="stat-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '18px' }}>{workout.name}</h3>
                  <span className="badge">{workout.weekDay}</span>
                </div>
                <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-line', fontSize: '14px', backgroundColor: '#F9FAFB', padding: '15px', borderRadius: '8px' }}>
                  {workout.description}
                </p>
                <button className="btn-submit" onClick={() => alert('Na Parte 2 este botão irá salvar no banco!')}>
                  ✅ Concluir Treino
                </button>
              </div>
            ))
          ) : (
            <div className="stat-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <span style={{ fontSize: '40px' }}>😴</span>
              <h3 style={{ marginTop: '15px' }}>Sem treinos</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>O seu treinador ainda não enviou a sua ficha.</p>
            </div>
          )}
        </div>
      </div>

      {/* NOVO: NAVEGAÇÃO INFERIOR (BOTTOM NAV) */}
      <nav className="bottom-nav">
        <button className="nav-button active">
          <span className="nav-icon">🏋️</span>
          <span>Treinos</span>
        </button>
        <button className="nav-button" onClick={() => alert('Em breve: Página de Perfil')}>
          <span className="nav-icon">👤</span>
          <span>Perfil</span>
        </button>
        <button className="nav-button" onClick={handleLogout}>
          <span className="nav-icon" style={{ color: '#EF4444' }}>🚪</span>
          <span style={{ color: '#EF4444' }}>Sair</span>
        </button>
      </nav>
    </div>
  );
}