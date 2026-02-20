import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import api from '../services/api'

function Dashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalStudents: 0, activePlans: 0 })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
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
      toast.success('✅ Link de matrícula copiado! Envie para seu aluno.');
    } catch (error) {
      toast.error('Erro ao gerar convite.');
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return
    try {
      await api.delete(`/api/students/${id}`)
      toast.success('Aluno removido com sucesso!')
      fetchStudents(); fetchStats()
    } catch (error) { toast.error('Erro ao excluir aluno.') }
  }

  const handleLogout = () => {
    localStorage.clear()
    toast.success('Logout realizado!')
    setTimeout(() => navigate('/'), 500)
  }

  const openWorkoutModal = (student) => {
    setSelectedStudent(student)
    setWorkoutForm({ name: '', weekDay: '', description: '' })
    setIsWorkoutModalOpen(true)
  }

  const closeWorkoutModal = () => {
    setIsWorkoutModalOpen(false)
    setSelectedStudent(null)
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
      toast.success(`Treino enviado para ${selectedStudent.name}!`)
      closeWorkoutModal()
    } catch (error) { toast.error('Erro ao salvar o treino.') }
  }

  if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>A carregar sistema...</p>

  return (
    <div className="app-layout">
      <Toaster position="top-right" />
      
      {/* SIDEBAR PROFISSIONAL */}
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
        
        {/* Espaçador para empurrar o Sair para baixo */}
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
          <div className="stat-card">
            <h4>Total de Alunos</h4>
            <p>{stats.totalStudents || 0}</p>
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

        {/* MODAL DE TREINO MANTIDO (Vamos refiná-lo na Parte 2) */}
        {isWorkoutModalOpen && (
          <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div className="modal-content" style={{backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px'}}>
              <h2 style={{marginTop: 0}}>Novo Treino para {selectedStudent?.name}</h2>
              <form onSubmit={handleWorkoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <div className="form-group">
                  <label>Nome do Treino</label>
                  <input type="text" placeholder="Ex: Treino A" value={workoutForm.name} onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Dia da Semana</label>
                  <select value={workoutForm.weekDay} onChange={(e) => setWorkoutForm({...workoutForm, weekDay: e.target.value})} required>
                    <option value="">Selecione...</option>
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Exercícios</label>
                  <textarea rows="4" placeholder="1. Supino Reto (4x12)" value={workoutForm.description} onChange={(e) => setWorkoutForm({...workoutForm, description: e.target.value})} required />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={closeWorkoutModal} style={{padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer'}}>Cancelar</button>
                  <button type="submit" className="btn-submit" style={{width: 'auto', marginTop: 0}}>Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard