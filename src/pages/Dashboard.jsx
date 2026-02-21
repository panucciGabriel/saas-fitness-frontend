import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import api from '../services/api'

function Dashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalStudents: 0, activePlans: 0 })

  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentWorkouts, setStudentWorkouts] = useState([])
  const [studentHistory, setStudentHistory] = useState([]) // NOVO: Guarda o histórico
  const [activeTab, setActiveTab] = useState('workouts') // NOVO: Controla os separadores (workouts ou history)
  
  const [workoutForm, setWorkoutForm] = useState({ name: '', weekDay: '', description: '' })

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
      toast.success('✅ Link de matrícula copiado! Envie para o seu aluno.');
    } catch (error) {
      toast.error('Erro ao gerar convite.');
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Tem a certeza que deseja excluir este aluno?")) return
    try {
      await api.delete(`/api/students/${id}`)
      toast.success('Aluno removido com sucesso!')
      fetchStudents(); fetchStats()
    } catch (error) { toast.error('Erro ao excluir aluno.') }
  }

  const handleLogout = () => {
    localStorage.clear()
    toast.success('Sessão terminada!')
    setTimeout(() => navigate('/'), 500)
  }

  const fetchStudentWorkouts = async (studentId) => {
    try {
      const response = await api.get(`/api/workouts/student/${studentId}`)
      setStudentWorkouts(response.data)
    } catch (error) { console.error(error) }
  }

  // NOVO: Vai buscar o histórico de treinos concluídos
  const fetchStudentHistory = async (studentId) => {
    try {
      const response = await api.get(`/api/workouts/history/student/${studentId}`)
      // Ordena do mais recente para o mais antigo
      const sortedHistory = response.data.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      setStudentHistory(sortedHistory)
    } catch (error) { console.error(error) }
  }

  const openWorkoutModal = (student) => {
    setSelectedStudent(student)
    setWorkoutForm({ name: '', weekDay: '', description: '' })
    setActiveTab('workouts') // Reseta para a tab principal ao abrir
    setIsWorkoutModalOpen(true)
    fetchStudentWorkouts(student.id)
    fetchStudentHistory(student.id) // Carrega o histórico
  }

  const closeWorkoutModal = () => {
    setIsWorkoutModalOpen(false)
    setSelectedStudent(null)
    setStudentWorkouts([])
    setStudentHistory([])
  }

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/workouts', {
        name: workoutForm.name,
        weekDay: workoutForm.weekDay,
        description: workoutForm.description,
        studentId: selectedStudent.id
      })
      toast.success(`Treino adicionado!`)
      setWorkoutForm({ name: '', weekDay: '', description: '' })
      fetchStudentWorkouts(selectedStudent.id)
    } catch (error) { toast.error('Erro ao guardar o treino.') }
  }

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Deseja eliminar este treino?")) return
    try {
      await api.delete(`/api/workouts/${workoutId}`)
      toast.success('Treino eliminado!')
      fetchStudentWorkouts(selectedStudent.id)
    } catch (error) { toast.error('Erro ao eliminar treino.') }
  }

  if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>A carregar sistema...</p>

  return (
    <div className="app-layout">
      <Toaster position="top-right" />
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>💪 Fitness Pro</h2>
          <p style={{color: '#9CA3AF', fontSize: '13px', marginTop: '5px'}}>Painel do Personal</p>
        </div>
        <div className="nav-item active"><span>👥</span> Meus Alunos</div>
        <div className="nav-item" onClick={handleInvite}><span>🔗</span> Novo Convite</div>
        <div style={{ flex: 1 }}></div>
        <div className="nav-item" onClick={handleLogout} style={{ color: '#F87171', borderTop: '1px solid #374151' }}>
          <span>🚪</span> Sair da Conta
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)', margin: '0 0 5px 0' }}>Visão Geral</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Faça a gestão dos seus alunos e treinos.</p>
        </div>

        <div className="stats-container">
          <div className="stat-card"><h4>Total de Alunos</h4><p>{stats.totalStudents || 0}</p></div>
          <div className="stat-card"><h4>Planos Ativos</h4><p>{stats.activePlans || 0}</p></div>
        </div>

        <div className="card-container">
          <table className="students-table">
            <thead>
              <tr><th>Nome</th><th>E-mail</th><th>Plano</th><th width="150">Ações</th></tr>
            </thead>
            <tbody>
              {students.length > 0 ? students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td><span className="badge">{student.plan}</span></td>
                  <td>
                    <button onClick={() => openWorkoutModal(student)} className="action-btn" title="Gerir Treinos e Histórico">🏋️</button>
                    <button onClick={() => handleDelete(student.id)} className="action-btn" title="Excluir">🗑️</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#666'}}>Nenhum aluno registado. Gere um convite!</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL GESTOR DE TREINOS COM TABS */}
        {isWorkoutModalOpen && (
          <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div className="modal-content" style={{backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{margin: 0}}>Gestão: {selectedStudent?.name}</h2>
                <button onClick={closeWorkoutModal} style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}>✖</button>
              </div>

              {/* TABS DE NAVEGAÇÃO */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '2px solid #E5E7EB' }}>
                <button 
                  onClick={() => setActiveTab('workouts')}
                  style={{ background: 'none', border: 'none', padding: '10px 0', fontSize: '16px', fontWeight: activeTab === 'workouts' ? 'bold' : 'normal', color: activeTab === 'workouts' ? '#4F46E5' : '#6B7280', borderBottom: activeTab === 'workouts' ? '2px solid #4F46E5' : 'none', marginBottom: '-2px', cursor: 'pointer' }}
                >
                  📋 Planilha de Treinos
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  style={{ background: 'none', border: 'none', padding: '10px 0', fontSize: '16px', fontWeight: activeTab === 'history' ? 'bold' : 'normal', color: activeTab === 'history' ? '#10B981' : '#6B7280', borderBottom: activeTab === 'history' ? '2px solid #10B981' : 'none', marginBottom: '-2px', cursor: 'pointer' }}
                >
                  ✅ Histórico de Conclusão
                </button>
              </div>

              {/* CONTEÚDO DA TAB: WORKOUTS */}
              {activeTab === 'workouts' && (
                <>
                  <div style={{ marginBottom: '30px', background: '#F9FAFB', padding: '15px', borderRadius: '8px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '16px', color: '#374151' }}>Treinos Atuais</h3>
                    {studentWorkouts.length === 0 ? (
                      <p style={{ fontSize: '14px', color: '#6B7280' }}>Este aluno ainda não tem treinos atribuídos.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {studentWorkouts.map(workout => (
                          <li key={workout.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                            <div><strong>{workout.weekDay}</strong> - {workout.name}</div>
                            <button onClick={() => handleDeleteWorkout(workout.id)} style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Remover</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '20px 0' }} />
                  <h3 style={{ fontSize: '16px', color: '#374151', marginBottom: '15px' }}>Adicionar Novo Treino</h3>
                  <form onSubmit={handleWorkoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Dia da Semana</label>
                        <select value={workoutForm.weekDay} onChange={(e) => setWorkoutForm({...workoutForm, weekDay: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}>
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
                      <div className="form-group" style={{ flex: 2 }}>
                        <label>Nome do Treino</label>
                        <input type="text" placeholder="Ex: Treino A" value={workoutForm.name} onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}/>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Exercícios</label>
                      <textarea rows="4" placeholder="1. Supino Reto (4x12)" value={workoutForm.description} onChange={(e) => setWorkoutForm({...workoutForm, description: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}/>
                    </div>
                    <button type="submit" className="btn-submit" style={{width: '100%', padding: '12px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Gravar Treino</button>
                  </form>
                </>
              )}

              {/* CONTEÚDO DA TAB: HISTORY */}
              {activeTab === 'history' && (
                <div>
                  <h3 style={{ marginTop: 0, fontSize: '16px', color: '#374151', marginBottom: '15px' }}>Dias Treinados</h3>
                  {studentHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', background: '#F9FAFB', borderRadius: '8px' }}>
                      <p style={{ color: '#6B7280', margin: 0 }}>Este aluno ainda não registou nenhum treino concluído.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {studentHistory.map(record => {
                        // Cruza o ID do histórico com a lista de treinos para descobrir o Nome do Treino
                        const workoutInfo = studentWorkouts.find(w => w.id === record.workoutId)
                        const workoutName = workoutInfo ? workoutInfo.name : 'Treino Removido'
                        const dataFormatada = new Date(record.completedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

                        return (
                          <div key={record.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#F0FDF4', padding: '15px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                            <div style={{ fontSize: '24px' }}>✅</div>
                            <div>
                              <strong style={{ display: 'block', color: '#166534' }}>{workoutName}</strong>
                              <span style={{ fontSize: '13px', color: '#15803D' }}>Concluído em: {dataFormatada}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard