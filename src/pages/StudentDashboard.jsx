import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

export default function StudentDashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState({}); // Guarda o estado das checkboxes
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('userEmail') || 'Aluno';

  useEffect(() => {
    // Busca apenas os treinos do aluno logado
    api.get('/api/workouts/my')
      .then(res => setWorkouts(res.data))
      .catch(err => {
        if (err.response?.status !== 401) {
          toast.error('Erro ao carregar os seus treinos.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Sessão terminada!');
    setTimeout(() => navigate('/'), 500);
  };

  const toggleExercise = (workoutId, exerciseIndex) => {
    setCompletedExercises(prev => ({
      ...prev,
      [`${workoutId}-${exerciseIndex}`]: !prev[`${workoutId}-${exerciseIndex}`]
    }));
  };

  const handleCompleteWorkout = async (workoutId, workoutName) => {
    try {
      // Faz o POST para o backend registar o histórico na base de dados
      await api.post(`/api/workouts/${workoutId}/complete`);
      toast.success(`Parabéns! Registou a conclusão do ${workoutName} hoje! 🎉`);
    } catch (error) {
      toast.error('Erro ao registar a conclusão do treino. Tente novamente.');
      console.error(error);
    }
  };

  const weekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  return (
    <div className="dashboard-container" style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      <Toaster position="top-center" />
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>🏋️‍♂️ Os Meus Treinos</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Olá, {userEmail}</p>
        </div>
        <button onClick={handleLogout} className="action-btn" style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
      </header>

      <div className="card-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>A carregar os seus treinos...</p>
        ) : workouts.length === 0 ? (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Ainda não tem treinos</h3>
            <p style={{ color: '#6B7280' }}>Aguarde que o seu Personal Trainer adicione o seu plano. 💪</p>
          </div>
        ) : (
          weekDays.map(day => {
            const dayWorkouts = workouts.filter(w => w.weekDay === day);
            if (dayWorkouts.length === 0) return null;
            
            return (
              <div key={day} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📅 {day}
                </h3>
                
                {dayWorkouts.map(workout => (
                  <div key={workout.id} style={{ marginBottom: '15px' }}>
                    <div style={{ background: '#F3F4F6', padding: '15px', borderRadius: '8px' }}>
                      <strong style={{ display: 'block', fontSize: '18px', marginBottom: '10px', color: '#111827' }}>
                        {workout.name}
                      </strong>
                      
                      {/* Transforma o bloco de texto numa checklist interativa */}
                      {workout.description && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                          {workout.description.split('\n').map((line, index) => {
                            if (!line.trim()) return null; // Ignora as linhas em branco
                            const isChecked = completedExercises[`${workout.id}-${index}`] || false;
                            
                            return (
                              <label key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', opacity: isChecked ? 0.6 : 1, transition: '0.2s' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => toggleExercise(workout.id, index)}
                                  style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ textDecoration: isChecked ? 'line-through' : 'none', color: '#4B5563', lineHeight: '1.4' }}>
                                  {line}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => handleCompleteWorkout(workout.id, workout.name)}
                        style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      >
                        ✅ Concluir Treino
                      </button>
                    </div>
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