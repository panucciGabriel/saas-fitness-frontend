import { Navigate } from 'react-router-dom'

// Função para verificar se o token JWT está válido
function isTokenValid(token) {
  if (!token) return false;

  try {
    // Decodifica o payload do JWT (parte do meio)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Verifica se o token expirou (exp está em segundos)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.clear(); // Remove token expirado
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token inválido:', error);
    localStorage.clear();
    return false;
  }
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')

  // Verifica se tem token E se ele é válido
  return isTokenValid(token) ? children : <Navigate to="/login" />
}

export default PrivateRoute