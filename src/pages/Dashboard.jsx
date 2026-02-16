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
      // CORREÇÃO: Adicionado /api antes de /students
      const response = await api.get('/api/students')
      setStudents(response.data)
    } catch (error) {
      console.error("Erro ao buscar alunos:", error)
    }
  }

  // --- ESTATÍSTICAS (GET) ---
  const fetchStats = async () => {
    try {
      // CORREÇÃO: Adicionado /api antes de /students/stats
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
        // CORREÇÃO: Adicionado /api
        await api.put(`/api/students/${editingId}`, {
          name,
          email,
          plan: "Basic"
        })
        alert('Aluno atualizado com sucesso!')
      } else {
        // CORREÇÃO: Adicionado /api
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
      // CORREÇÃO: Adicionado /api
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

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{margin:0}}>🏋️‍♂️ Gestão de Alunos</h1>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <span style={{fontSize: '14px', color: '#666'}}>
            Logado como: <strong>{localStorage.getItem('userEmail')}</strong>
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sair</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={styles.statCard}>
          <h4 style={{margin: 0, color: '#666'}}>Total de Alunos</h4>
          <p style={{fontSize: '28px', fontWeight: 'bold', margin: '10px 0'}}>
            {stats.totalStudents || 0}
          </p>
        </div>
        <div style={styles.statCard}>
          <h4 style={{margin: 0, color: '#666'}}>Planos Ativos</h4>
          <p style={{fontSize: '28px', fontWeight: 'bold', margin: '10px 0', color: '#28a745'}}>
            {stats.activePlans || 0}
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <h3>{editingId ? '✏️ Editando Aluno' : '➕ Novo Aluno'}</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            type="text" 
            placeholder="Nome Completo" 
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={styles.input}
          />
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          
          <div style={{display: 'flex', gap: '10px'}}>
            <button type="submit" style={editingId ? styles.saveBtn : styles.addBtn}>
              {editingId ? 'Salvar Alterações' : 'Adicionar Aluno'}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setName(''); setEmail(''); }}
                style={styles.cancelBtn}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={{borderBottom: '2px solid #eee', textAlign: 'left'}}>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>E-mail</th>
              <th style={styles.th}>Plano</th>
              <th style={styles.th} width="150">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map(student => (
              <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={styles.td}>{student.name}</td>
                <td style={styles.td}>{student.email}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{student.plan}</span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => startEditing(student)} style={styles.actionBtnEdit} title="Editar">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(student.id)} style={styles.actionBtnDel} title="Excluir">
                    🗑️
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{padding: '20px', textAlign: 'center', color: '#999'}}>
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

const styles = {
  container: { padding: '30px', fontFamily: 'Arial', backgroundColor: '#f0f2f5', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  statCard: { flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #007bff' },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1, minWidth: '200px' },
  addBtn: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  saveBtn: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px', color: '#555', fontWeight: '600' },
  td: { padding: '15px', color: '#333' },
  badge: { backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  actionBtnEdit: { marginRight: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' },
  actionBtnDel: { border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }
}

export default Dashboard