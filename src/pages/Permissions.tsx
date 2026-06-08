import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';

interface Permission {
  id: number;
  personal_nombre: string;
  personal_apellido: string;
  especialidad: string;
  tipo: string;
  tipo_display: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  estado: string;
  fecha_solicitud: string;
  personal_foto?: string | null;
}

export const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ id: 0, action: 'approve', title: '', message: '', variant: 'primary' as any });
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('personnel/permissions/');
      setPermissions(response.data);
    } catch (error) {
      console.error("Error fetching permissions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    const interval = setInterval(() => {
      // Background fetch without setting loading to true to avoid flicker
      api.get('personnel/permissions/').then(response => {
        setPermissions(response.data);
      }).catch(e => console.error(e));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openConfirm = (id: number, actionType: 'approve' | 'reject') => {
    setConfirmConfig({
      id,
      action: actionType,
      title: actionType === 'approve' ? 'Aprobar Permiso' : 'Rechazar Permiso',
      message: actionType === 'approve' 
        ? '¿Estás seguro de que deseas aprobar esta solicitud de permiso? El profesional será notificado.'
        : '¿Estás seguro de que deseas rechazar esta solicitud? Esta acción no se puede deshacer.',
      variant: actionType === 'approve' ? 'success' : 'danger'
    });
    setConfirmOpen(true);
  };

  const handleAction = async () => {
    const { id, action: actionType } = confirmConfig;
    setConfirmOpen(false);
    try {
      await api.post(`personnel/permissions/${id}/${actionType}/`);
      fetchPermissions();
      showToast(`Permiso ${actionType === 'approve' ? 'aprobado' : 'rechazado'} con éxito.`, 'success');
    } catch (error: any) {
      console.error(`Error ${actionType}ing permission`, error);
      showToast(error?.response?.data?.detail || "Hubo un error al procesar la solicitud.", 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'var(--status-yellow)';
      case 'Aprobado': return 'var(--status-green)';
      case 'Rechazado': return 'var(--status-red)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="flex-col gap-6" style={{ position: 'relative' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontWeight: 'bold',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.action === 'approve' ? 'Aprobar' : 'Rechazar'}
        confirmVariant={confirmConfig.variant}
        onConfirm={handleAction}
        onCancel={() => setConfirmOpen(false)}
      />

      <header className="flex flex-col-mobile justify-between items-center mb-6" style={{ gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-3xl font-bold">Permisos y Licencias</h1>
          <p>Gestiona las solicitudes de vacaciones, descansos médicos y otros permisos del personal.</p>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Cargando solicitudes...</div>
      ) : (
        <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="sleek-table">
              <thead>
                <tr>
                  <th>Fecha Solicitud</th>
                  <th>Profesional Médico</th>
                  <th>Tipo y Fechas</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                      No hay solicitudes registradas en el sistema.
                    </td>
                  </tr>
                ) : (
                  permissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.fecha_solicitud}</td>
                      <td>
                        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {p.personal_foto ? (
                            <img src={p.personal_foto} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-main)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                              {p.personal_nombre[0]}{p.personal_apellido[0]}
                            </div>
                          )}
                          <div>
                            <div>Dr/Dra. {p.personal_nombre} {p.personal_apellido}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.especialidad}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{p.tipo_display}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {p.fecha_inicio} a {p.fecha_fin}
                        </div>
                      </td>
                      <td style={{ maxWidth: '250px', whiteSpace: 'normal', fontSize: '0.9rem' }}>{p.motivo}</td>
                      <td>
                        {p.estado === 'Pendiente' && <Badge status="yellow">Pendiente</Badge>}
                        {p.estado === 'Aprobado' && <Badge status="green">Aprobado</Badge>}
                        {p.estado === 'Rechazado' && <Badge status="red">Rechazado</Badge>}
                      </td>
                      <td>
                        {p.estado === 'Pendiente' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => openConfirm(p.id, 'approve')}
                              title="Aprobar Permiso"
                              style={{ 
                                padding: '8px', 
                                backgroundColor: '#ecfdf5', 
                                color: '#10b981', 
                                border: '1px solid #a7f3d0', 
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                            >
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            </button>
                            <button 
                              onClick={() => openConfirm(p.id, 'reject')}
                              title="Rechazar Permiso"
                              style={{ 
                                padding: '8px', 
                                backgroundColor: '#fef2f2', 
                                color: '#ef4444', 
                                border: '1px solid #fecaca', 
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            >
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Procesado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Mostrando {permissions.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, permissions.length)} de {permissions.length} registros
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === 1 ? '#f1f5f9' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Anterior
              </button>
              <span style={{ padding: '6px 12px', fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>
                Página {currentPage} de {Math.max(1, Math.ceil(permissions.length / itemsPerPage))}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(permissions.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.max(1, Math.ceil(permissions.length / itemsPerPage))}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === Math.max(1, Math.ceil(permissions.length / itemsPerPage)) ? '#f1f5f9' : 'white', color: currentPage === Math.max(1, Math.ceil(permissions.length / itemsPerPage)) ? '#94a3b8' : '#334155', cursor: currentPage === Math.max(1, Math.ceil(permissions.length / itemsPerPage)) ? 'not-allowed' : 'pointer' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
