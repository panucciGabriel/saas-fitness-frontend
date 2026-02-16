import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
// ... outros imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz redireciona para Login ou Dashboard */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* As rotas precisam estar definidas assim: */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ... outras rotas ... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;