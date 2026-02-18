import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import api from '../services/api'

function Dashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalStudents: 0, activePlans: 0 })

  // Estados para edição manual (opcional, mantido para compatibilidade)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editingId, setEditingId] = useState(null)

  const navigate = useNavigate()

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students')
      setStudents(response.data)
    } catch (error) {
      console.error("Erro ao buscar alunos:", error)
      if (error.response && error.response.status === 401) {
        handleLogout()
      }
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/students/stats')
      setStats(response.data)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStudents(), fetchStats()])
      setLoading(false)
    }
    loadData()
  }, [])

  // --- LÓGICA DO CONVITE SELF-SERVICE ---
  const handleInvite = async () => {
    try {
      const response = await api.post('/api/invites')
      const link = response.data.link;

      // Copia para o clipboard
      await navigator.clipboard.writeText(link);
      toast.success('✅ Link de matrícula copiado! Envie para seu aluno.');

    } catch (error) {
      toast.error('Erro ao gerar convite. Tente novamente.');
      console.error(error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        // Edição: apenas atualiza nome, email e plano (sem senha)
        await api.put(`/api/students/${editingId}`, { name, email, plan: "Basic" })
        toast.success('Aluno atualizado com sucesso!')
      } else {
        // Criação direta pelo Personal (sem convite) — senha temporária gerada
        // O fluxo recomendado é via link de convite (botão "Link de Matrícula")
        const tempPassword = Math.random().toString(36).slice(-8);
        await api.post('/api/students', { name, email, plan: "Basic", password: tempPassword })
        toast.success(`Aluno cadastrado! Senha temporária: ${tempPassword} (informe ao aluno)`)
      }
      setName(''); setEmail(''); setEditingId(null)
      fetchStudents(); fetchStats()
    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao salvar aluno.'
      toast.error(msg)
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return
    try {
      await api.delete(`/api/students/${id}`)
      toast.success('Aluno removido com sucesso!')
      fetchStudents(); fetchStats()
    } catch (error) {
      toast.error('Erro ao excluir aluno.')
      console.error(error)
    }
  }

  const startEditing = (student) => {
    setName(student.name); setEmail(student.email); setEditingId(student.id)
  }

  const handleLogout = () => {
    localStorage.clear()
    toast.success('Logout realizado!')
    setTimeout(() => navigate('/'), 500)
  }

  if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>Carregando sistema...</p>

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      <header className="dashboard-header">
        <div>
          <h1 style={{ margin: 0 }}>🏋️‍♂️ Gestão de Alunos</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Painel do Personal</p>
        </div>

        <div className="user-info">
          <button onClick={handleInvite} className="btn-invite" style={{ backgroundColor: '#28a745', color: 'white', marginRight: '10px' }}>
            🔗 Link de Matrícula
          </button>

          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Total de Alunos</h4>
          <p>{stats.totalStudents || 0}</p>
        </div>
        <div className="stat-card active-plan">
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
                  <button onClick={() => startEditing(student)} className="action-btn">✏️</button>
                  <button onClick={() => handleDelete(student.id)} className="action-btn">🗑️</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="empty-state">Nenhum aluno cadastrado. Gere um link de matrícula!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard