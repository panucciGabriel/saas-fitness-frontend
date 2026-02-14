import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Faz a chamada ao Java
      const response = await axios.post('http://localhost:8080/auth/login', {
        email: email,
        password: password
      })

      // 2. Extrai o token
      const token = response.data.token 
      
      // 3. Salva no navegador (Token + Email para o contexto do Tenant)
      localStorage.setItem('token', token)
      localStorage.setItem('userEmail', email) 

      // 4. Redireciona para o Dashboard
      navigate('/dashboard') 

    } catch (error) {
      console.error(error)
      alert('Erro no login! Verifique se o e-mail e a senha estão corretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>🔐 Acesso ao SaaS</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Entre para gerenciar sua academia.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input 
              type="email" 
              placeholder="ex: dono@iron.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input 
              type="password" 
              placeholder="Sua senha secreta" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Ainda não é cliente?{' '}
          <span onClick={() => navigate('/register')} style={styles.link}>
            Crie sua conta grátis
          </span>
        </p>
      </div>
    </div>
  )
}

// Estilos CSS-in-JS para manter a consistência com a tela de Registro
const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white', padding: '40px', borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#555' },
  input: {
    padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px', outline: 'none'
  },
  button: {
    padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none',
    borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold',
    transition: 'background 0.3s', marginTop: '10px'
  },
  link: { color: '#007bff', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }
}

export default Login