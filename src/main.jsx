import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google' 

// 🌟 O SALVADOR: Trazendo o BrowserRouter de volta!
import { BrowserRouter } from 'react-router-dom'

// Lembre-se de colar a sua chave real do Google aqui!
const GOOGLE_CLIENT_ID = "629004845915-6ge8nhfsdh3r8a5dd59pnvogc6875bot.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* 🌟 O BrowserRouter volta a envolver o App */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)