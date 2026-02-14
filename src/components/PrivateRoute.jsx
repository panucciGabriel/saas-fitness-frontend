import { Navigate } from 'react-router-dom'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')

  // Se tem token, renderiza o conteúdo (children)
  // Se não tem, redireciona para o Login ("/")
  return token ? children : <Navigate to="/" />
}

export default PrivateRoute