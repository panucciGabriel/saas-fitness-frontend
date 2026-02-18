import { Routes, Route, Navigate } from 'react-router-dom'; // Remova 'BrowserRouter' daqui
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    // Remova o <BrowserRouter> que envolvia tudo aqui
    <Routes>
      {/* Rota padrão joga para Login */}
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rota do Personal */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Rota do Aluno */}
      <Route
        path="/student-dashboard"
        element={
          <PrivateRoute>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      {/* Rota 404 */}
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}

export default App;