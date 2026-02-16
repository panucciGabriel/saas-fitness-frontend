import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api' // Usando nossa API configurada

function Dashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalStudents: 0, activePlans: 0 })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editingId, setEditingId] = useState(null)
  
  const navigate = useNavigate()

  // --- LEITURA (GET) ---
  const fetchStudents = async () => {
    try {
      // CORREÇÃO: Adicionado /api aqui
      const response = await api.get('/api/students')
      setStudents(response.data)
    } catch (error) {
      console.error("Erro ao buscar alunos:", error)
    }
  }

  // --- ESTATÍSTICAS (GET) ---
  const fetchStats = async () => {
    try {
      // CORREÇÃO: Adicionado /api aqui
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

  // --- ESCRITA (POST ou PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        // CORREÇÃO: Adicionado /api aqui
        await api.put(`/api/students/${editingId}`, {
          name,
          email,
          plan: "Basic"
        })
        alert('Aluno atualizado com sucesso!')
      } else {
        // CORREÇÃO: Adicionado /api aqui
        await api.post('/api/students', {
          name,
          email,
          plan: "Basic"
        })
        alert('Aluno cadastrado com sucesso!')
      }
      
      setName('')
      setEmail('')
      setEditingId(null)
      fetchStudents() 
      fetchStats()

    } catch (error) {
      alert('Erro ao salvar aluno')
      console.error(error)
    }
  }

  // --- EXCLUSÃO (DELETE) ---
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este aluno?")) return

    try {
      // CORREÇÃO: Adicionado /api aqui
      await api.delete(`/api/students/${id}`)
      alert('Aluno removido!')
      fetchStudents()
      fetchStats()
    } catch (error) {
      alert('Erro ao excluir')
      console.error(error)
    }
  }

  const startEditing = (student) => {
    setName(student.name)
    setEmail(student.email)
    setEditingId(student.id)
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  if (loading) return <p style={{padding:'20px'}}>Carregando sistema...</p>

  // --- PARTE VISUAL (MANTIDA IGUAL) ---
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🏋️‍♂️ Gestão de Alunos</h1>
        <div className="user-info">
          <span>Logado como: <strong>{localStorage.getItem('userEmail')}</strong></span>
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
        <h3>{editingId ? '✏️ Editando Aluno' : '➕ Novo Aluno'}</h3>
        <form onSubmit={handleSubmit} className="student-form">
          <input 
            type="text" 
            placeholder="Nome Completo" 
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          
          <div className="form-actions">
            <button type="submit" className={editingId ? 'btn-save' : 'btn-add'}>
              {editingId ? 'Salvar Alterações' : 'Adicionar Aluno'}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setName(''); setEmail(''); }}
                className="btn-cancel"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
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
                  <button onClick={() => startEditing(student)} className="action-btn" title="Editar">✏️</button>
                  <button onClick={() => handleDelete(student.id)} className="action-btn" title="Excluir">🗑️</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="empty-state">
                  Nenhum aluno cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard