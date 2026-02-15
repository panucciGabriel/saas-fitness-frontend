import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // IMPORTANTE: Importando nosso arquivo configurado

export default function Register() {
    // Ajuste os campos conforme o seu Backend espera (ex: name, email, password, role)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT' // Exemplo: Valor padrão se seu back exigir
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // AQUI ESTAVA O ERRO!
            // Antes: await axios.post('http://localhost:8080/auth/register', ...)
            // Agora: O 'api' já sabe o endereço da Vercel ou do Localhost sozinho.
            const response = await api.post('/auth/register', formData);
            
            console.log('Sucesso:', response.data);
            alert('Cadastro realizado com sucesso!');
            navigate('/login'); // Redireciona para login
        } catch (err) {
            console.error('Erro no registro:', err);
            // Tenta pegar a mensagem de erro do backend ou usa uma genérica
            const msg = err.response?.data?.message || 'Erro ao conectar com o servidor.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-container">
            <h2>Crie sua Conta</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* Se tiver campo de Perfil/Role, adicione aqui */}

                <button type="submit" disabled={loading}>
                    {loading ? 'Carregando...' : 'Cadastrar'}
                </button>
            </form>
            
            <p>Já tem conta? <a href="/login">Faça Login</a></p>
        </div>
    );
}