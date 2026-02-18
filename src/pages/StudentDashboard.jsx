import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

export default function StudentDashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('userEmail') || 'Aluno';

  useEffect(() => {
    api.get('/api/workouts')
      .then(res => setWorkouts(res.data))
      .catch(err => {
        if (err.response?.status !== 401) {
          toast.error('Erro ao carregar treinos.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logout realizado!');
    setTimeout(() => navigate('/'), 500);
  };

  const weekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      <header className="dashboard-header">
        <div>
          <h1>🏋️‍♂️ Meus Treinos</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Olá, {userEmail}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">Sair</button>
      </header>

      <div className="card-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Carregando treinos...</p>
        ) : workouts.length === 0 ? (
          <div className="stat-card" style={{ maxWidth: '100%' }}>
            <h3>Nenhum treino cadastrado ainda</h3>
            <p>Aguarde seu personal montar sua planilha de treinos. 💪</p>
          </div>
        ) : (
          weekDays.map(day => {
            const dayWorkouts = workouts.filter(w => w.weekDay === day);
            if (dayWorkouts.length === 0) return null;
            return (
              <div key={day} className="stat-card" style={{ maxWidth: '100%', marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '12px' }}>📅 {day}</h3>
                {dayWorkouts.map(workout => (
                  <div key={workout.id} style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '8px' }}>
                    <strong>{workout.name}</strong>
                    {workout.description && <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>{workout.description}</p>}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
