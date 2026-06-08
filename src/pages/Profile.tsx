import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

export const Profile = () => {
  return (
    <div className="flex-col gap-6" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <header className="flex flex-col-mobile justify-between items-center mb-6" style={{ gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Gestión de tu cuenta de administrador.</p>
        </div>
      </header>

      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            A
          </div>
          <div>
            <h2 className="text-2xl font-bold">Administrador del Sistema</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Recursos Humanos / Dirección Médica</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Información de la Cuenta</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Nombre de Usuario</label>
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: '500' }}>
                  admin
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Rol en el Sistema</label>
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: '500' }}>
                  Super Administrador
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Correo de Contacto</label>
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: '500' }}>
                  admin@hospital.com
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Último Acceso</label>
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: '500' }}>
                  Hace unos momentos
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginTop: '16px' }}>Seguridad</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Para cambiar la contraseña de acceso al sistema experto o habilitar la autenticación de dos factores, por favor contacta al soporte técnico o usa la terminal del servidor (manage.py).
            </p>
            <Button variant="danger" onClick={() => {
              localStorage.removeItem('access_token');
              window.location.href = '/';
            }}>
              Cerrar Sesión Segura
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
