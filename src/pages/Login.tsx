import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import api from '../api/axios';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  React.useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => setLockoutSeconds(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Error de autenticación', err);
      if (err.response && err.response.data && err.response.data.detail) {
        // Muestra el mensaje exacto del backend (ej. intentos restantes o cuenta bloqueada)
        const detail = err.response.data.detail;
        setError(detail);
        
        let seconds = 0;
        if (detail.includes('Intente en')) {
          const match = detail.match(/Intente en (\d+) segundos/);
          if (match) seconds = parseInt(match[1], 10);
        } else if (detail.includes('Expected available in')) {
          const match = detail.match(/Expected available in (\d+) seconds/);
          if (match) seconds = parseInt(match[1], 10);
        } else if (detail.includes('bloqueada por 1 minuto')) {
          seconds = 60;
        }

        if (seconds > 0) {
          setLockoutSeconds(seconds);
        }
      } else {
        setError('Credenciales inválidas o error de conexión.');
      }
    }
  };

  return (
    <div className="flex-col justify-center items-center" style={{ minHeight: '100vh', padding: '20px' }}>
      
      <GlassCard className="text-center" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--accent)', borderRadius: '16px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px var(--accent-glow)' }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Sistema Experto Clínico</h1>
          <p>Motor de Asignación e Índice de Fatiga</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          {error && <div style={{ color: 'var(--status-red)', marginBottom: '10px' }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Nombre de Usuario</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="admin" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-4" 
            style={{ height: '50px', opacity: lockoutSeconds > 0 ? 0.7 : 1 }}
            disabled={lockoutSeconds > 0}
          >
            {lockoutSeconds > 0 ? `Bloqueado (${lockoutSeconds}s)` : 'Iniciar Sesión'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
