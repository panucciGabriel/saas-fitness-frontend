import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import api from '../services/api'

function Dashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalStudents: 0, activePlans: 0 })

  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false) 
  
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [workoutForm, setWorkoutForm] = useState({ name: '', weekDay: '', description: '' })
  
  // 🌟 NOVO ESTADO: Guardar os treinos do aluno
  const [studentWorkouts, setStudentWorkouts] = useState([])
  
  const [userName, setUserName] = useState('Personal')

  const navigate = useNavigate()

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students')
      setStudents(response.data)
    } catch (error) {
      if (error.response && error.response.status === 401) handleLogout()
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/students/stats')
      setStats(response.data)
    } catch (error) { console.error(error) }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.name) {
          const capitalized = payload.name.charAt(0).toUpperCase() + payload.name.slice(1)
          setUserName(capitalized)
        } else if (payload.sub) {
          setUserName(payload.sub.split('@')[0])
        }
      } catch (e) {
        console.error("Erro ao ler token", e)
      }
    }

    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStudents(), fetchStats()])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleInvite = async () => {
    try {
      const response = await api.post('/api/invites')
      const link = response.data.link;
      await navigator.clipboard.writeText(link);
      toast.success('✅ Link de matrícula copiado! Envie para seu aluno.');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setIsUpgradeModalOpen(true); 
      } else {
        toast.error('Erro ao gerar convite.');
      }
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    toast.success('Logout realizado com sucesso!')
    setTimeout(() => navigate('/login'), 500) 
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return
    try {
      await api.delete(`/api/students/${id}`)
      toast.success('Aluno removido com sucesso!')
      fetchStudents(); fetchStats()
    } catch (error) { toast.error('Erro ao excluir aluno.') }
  }

  // 🌟 ATUALIZADO: Busca os treinos ao abrir o modal
  const openWorkoutModal = async (student) => {
    setSelectedStudent(student)
    setWorkoutForm({ name: '', weekDay: '', description: '' })
    setIsWorkoutModalOpen(true)
    
    try {
      const response = await api.get(`/api/workouts/student/${student.id}`)
      setStudentWorkouts(response.data)
    } catch (error) {
      toast.error('Erro ao carregar os treinos do aluno.')
    }
  }

  const closeWorkoutModal = () => {
    setIsWorkoutModalOpen(false)
    setSelectedStudent(null)
    setStudentWorkouts([])
  }

  // 🌟 NOVO: Função para apagar treino
  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Apagar este treino?")) return
    try {
      await api.delete(`/api/workouts/${workoutId}`)
      toast.success('Treino removido!')
      setStudentWorkouts(studentWorkouts.filter(w => w.id !== workoutId))
    } catch (error) {
      toast.error('Erro ao apagar treino.')
    }
  }

  // 🌟 ATUALIZADO: Atualiza a lista na hora, sem fechar o modal
  const handleWorkoutSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/api/workouts', {
        name: workoutForm.name,
        weekDay: workoutForm.weekDay,
        description: workoutForm.description,
        studentId: selectedStudent.id
      })
      toast.success(`Treino adicionado!`)
      setStudentWorkouts([...studentWorkouts, response.data])
      setWorkoutForm({ name: '', weekDay: '', description: '' })
    } catch (error) { toast.error('Erro ao salvar o treino.') }
  }

  if (loading) return <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>A carregar o seu painel...</p>

  return (
    <div className="app-layout">
      <Toaster position="top-right" />
      
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>💪 Fitness Pro</h2>
          <p style={{color: '#9CA3AF', fontSize: '13px', marginTop: '5px'}}>Painel do Personal</p>
        </div>
        
        <div className="nav-item active">
          <span>👥</span> Meus Alunos
        </div>
        
        <div className="nav-item" onClick={handleInvite}>
          <span>🔗</span> Novo Convite
        </div>

        <div className="nav-item" onClick={() => setIsUpgradeModalOpen(true)} style={{ color: '#F59E0B' }}>
          <span>⭐</span> Meu Plano
        </div>
        
        <div style={{ flex: 1 }}></div>

        <div className="nav-item" onClick={handleLogout} style={{ color: '#F87171', borderTop: '1px solid #374151' }}>
          <span>🚪</span> Sair da Conta
        </div>
      </aside>

      <main className="main-content">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)', margin: '0 0 5px 0' }}>
            Olá, {userName}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Faça a gestão dos seus alunos e treinos.</p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h4>Total de Alunos</h4>
            <p>{stats.totalStudents || 0} / 5</p>
          </div>
          <div className="stat-card">
            <h4>Planos Ativos</h4>
            <p>{stats.activePlans || 0}</p>
          </div>
        </div>

        <div className="card-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Plano</th>
                <th width="150">Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td><span className="badge">{student.plan}</span></td>
                  <td>
                    <button onClick={() => openWorkoutModal(student)} className="action-btn" title="Adicionar Treino">🏋️</button>
                    <button onClick={() => handleDelete(student.id)} className="action-btn" title="Excluir">🗑️</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#666'}}>Nenhum aluno cadastrado. Gere um convite!</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🌟 NOVO MODAL DIVIDIDO */}
        {isWorkoutModalOpen && (
          <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div className="modal-content" style={{backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '800px', display: 'flex', gap: '30px', maxHeight: '90vh', overflowY: 'auto'}}>
              
              {/* LADO ESQUERDO: Lista de Treinos */}
              <div style={{ flex: 1, borderRight: '1px solid #e5e7eb', paddingRight: '20px' }}>
                <h2 style={{marginTop: 0}}>Treinos de {selectedStudent?.name}</h2>
                
                {studentWorkouts.length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic', marginTop: '20px' }}>Nenhum treino cadastrado ainda.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {studentWorkouts.map(workout => (
                      <div key={workout.id} style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ color: '#111827' }}>{workout.name}</strong>
                          <span style={{ fontSize: '12px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px' }}>{workout.weekDay}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#4b5563', whiteSpace: 'pre-wrap', margin: '0 0 10px 0' }}>{workout.description}</p>
                        <div style={{ textAlign: 'right' }}>
                          <button onClick={() => handleDeleteWorkout(workout.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>🗑️ Apagar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LADO DIREITO: Criar Novo Treino */}
              <div style={{ flex: 1 }}>
                <h3 style={{marginTop: 0, color: '#374151'}}>+ Criar Novo Treino</h3>
                <form onSubmit={handleWorkoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group">
                    <label>Nome do Treino</label>
                    <input type="text" placeholder="Ex: Treino A - Peito" value={workoutForm.name} onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Dia da Semana</label>
                    <select value={workoutForm.weekDay} onChange={(e) => setWorkoutForm({...workoutForm, weekDay: e.target.value})} required>
                      <option value="">Selecione...</option>
                      <option value="Segunda-feira">Segunda-feira</option>
                      <option value="Terça-feira">Terça-feira</option>
                      <option value="Quarta-feira">Quarta-feira</option>
                      <option value="Quinta-feira">Quinta-feira</option>
                      <option value="Sexta-feira">Sexta-feira</option>
                      <option value="Sábado">Sábado</option>
                      <option value="Domingo">Domingo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Exercícios (Texto Livre)</label>
                    <textarea rows="6" placeholder="1. Supino Reto (4x12)&#10;2. Crucifixo (3x15)" value={workoutForm.description} onChange={(e) => setWorkoutForm({...workoutForm, description: e.target.value})} required />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" onClick={closeWorkoutModal} style={{padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer'}}>Fechar</button>
                    <button type="submit" className="btn-submit" style={{width: 'auto', marginTop: 0}}>Adicionar Treino</button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

        {isUpgradeModalOpen && (
          <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div className="modal-content" style={{backgroundColor: 'white', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}}>
              
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚀</div>
              <h2 style={{marginTop: 0, color: '#111827', fontSize: '24px'}}>Faça o Upgrade para o PRO</h2>
              
              <p style={{ color: '#4B5563', marginBottom: '30px', lineHeight: '1.5' }}>
                Você atingiu o limite de 5 alunos do <strong>Plano Grátis</strong>. Desbloqueie todo o seu potencial e fature mais com o plano profissional!
              </p>
              
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#92400E' }}>Benefícios do PRO</h3>
                <ul style={{ textAlign: 'left', margin: 0, paddingLeft: '20px', color: '#92400E', lineHeight: '1.8' }}>
                  <li><strong>Alunos Ilimitados</strong></li>
                  <li>Suporte Prioritário no WhatsApp</li>
                  <li>Avaliações Físicas (Em breve)</li>
                  <li>Gestão Financeira (Em breve)</li>
                </ul>
                <h2 style={{ margin: '20px 0 0 0', color: '#D97706', fontSize: '32px' }}>
                  R$ 49,90<span style={{ fontSize: '16px', color: '#B45309', fontWeight: 'normal' }}>/mês</span>
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={() => setIsUpgradeModalOpen(false)} style={{padding: '12px 24px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '600'}}>
                  Voltar
                </button>
                <button 
                  onClick={() => alert('Integração com MercadoPago/Stripe será feita na próxima fase!')} 
                  className="btn-submit" 
                  style={{width: 'auto', marginTop: 0, backgroundColor: '#F59E0B', padding: '12px 24px', fontSize: '16px'}}
                >
                  Assinar Agora
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard