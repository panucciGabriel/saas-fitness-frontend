import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('http://localhost:8080/auth/register', {
        name: name,
        email: email
      })

      alert('🚀 Academia criada com sucesso! Faça login com seu e-mail.')
      navigate('/') 

    } catch (error) {
      console.error(error)
      alert('Erro ao criar conta. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Crie sua Conta SaaS</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Experimente grátis e tenha seu próprio banco de dados isolado.
        </p>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Nome da Academia</label>
            <input 
              type="text" 
              placeholder="Ex: Crossfit Iron" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>E-mail do Dono</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Criando ambiente...' : 'Começar Agora 🚀'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          Já tem conta? <span onClick={() => navigate('/')} style={styles.link}>Fazer Login</span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white', padding: '40px', borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  input: {
    padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px'
  },
  button: {
    padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none',
    borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold',
    transition: 'background 0.3s'
  },
  link: { color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }
}

export default Register