import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const isInitialLoad = useRef(true);
  const prevIds = useRef<number[]>([]);

  useEffect(() => {
    const storedDismissed = localStorage.getItem('dismissed_notifications');
    if (storedDismissed) {
      setDismissedIds(JSON.parse(storedDismissed));
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoad.current) {
      const currentIds = pendingRequests.map(p => p.id);
      const hasNew = currentIds.some(id => !prevIds.current.includes(id));
      if (hasNew) {
        playNotificationSound();
      }
      prevIds.current = currentIds;
    } else if (pendingRequests.length > 0 || isInitialLoad.current) {
      prevIds.current = pendingRequests.map(p => p.id);
      if (pendingRequests.length > 0) isInitialLoad.current = false;
    }
  }, [pendingRequests]);

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio no soportado");
    }
  };

  const fetchPendingPermissions = async () => {
    try {
      const response = await api.get('personnel/permissions/');
      const pending = response.data.filter((p: any) => p.estado === 'Pendiente');
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  useEffect(() => {
    fetchPendingPermissions();
    // Poll every 5 seconds for new notifications (for fast demo purposes)
    const interval = setInterval(fetchPendingPermissions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  const activeNotifications = pendingRequests.filter(req => !dismissedIds.includes(req.id));

  const handleDismiss = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
  };

  const handleMarkAllAsSeen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allPendingIds = pendingRequests.map(req => req.id);
    const newDismissed = Array.from(new Set([...dismissedIds, ...allPendingIds]));
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
    setNotifDropdownOpen(false);
  };

  return (
    <header className="topbar" style={{ zIndex: 1000, position: 'relative' }}>
      <div className="flex-row gap-4">
        <button className="hamburger-btn" onClick={onMenuClick}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <span className="font-bold text-primary">Panel Principal</span>
      </div>
      
      <div className="flex-row gap-4">
        {/* Notificaciones */}
        <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => {
            if (activeNotifications.length > 0 || pendingRequests.length > 0) {
              setNotifDropdownOpen(!notifDropdownOpen);
              setDropdownOpen(false);
            } else {
              navigate('/permissions');
            }
          }}>
          <svg width="24" height="24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          {activeNotifications.length > 0 && (
            <span style={{ 
              position: 'absolute', top: '-6px', right: '-6px', 
              width: '18px', height: '18px', 
              backgroundColor: 'var(--status-red)', 
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%' 
            }}>
              {activeNotifications.length}
            </span>
          )}

          {/* Menú Desplegable Notificaciones */}
          {notifDropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 15px)', right: '-50px',
              backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column', width: '320px',
              zIndex: 9999, overflow: 'hidden', animation: 'fadeInDown 0.2s ease-out'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  Notificaciones
                </h4>
                {activeNotifications.length > 0 && (
                  <span style={{ backgroundColor: 'var(--status-red)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{activeNotifications.length} nuevas</span>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {activeNotifications.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 8px', opacity: 0.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    <p style={{ margin: 0 }}>No hay notificaciones nuevas.</p>
                  </div>
                ) : (
                  activeNotifications.map(req => (
                    <div key={req.id} style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'background-color 0.2s', position: 'relative' }} 
                         onClick={(e) => { e.stopPropagation(); setNotifDropdownOpen(false); navigate('/permissions'); }}
                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      {req.personal_foto ? (
                        <img src={req.personal_foto} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                          {req.personal_nombre[0]}{req.personal_apellido[0]}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', paddingRight: '20px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>Dr. {req.personal_apellido}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Solicita: {req.tipo_display}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '500' }}>Para: {req.fecha_inicio}</span>
                      </div>
                      <button 
                        onClick={(e) => handleDismiss(e, req.id)}
                        title="Marcar como visto (Descartar de esta lista)"
                        style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '8px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '4px' }}>
                {activeNotifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsSeen}
                    style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Marcar todo visto
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setNotifDropdownOpen(false); navigate('/permissions'); }}
                  style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: 'var(--primary)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Ir a la Consola
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Avatar Usuario */}
        <div className="flex-row gap-2" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => { setDropdownOpen(!dropdownOpen); setNotifDropdownOpen(false); }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            A
          </div>
          <div className="flex-col" style={{ gap: '0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Admin</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recursos Humanos</span>
          </div>

          {/* Menú Desplegable */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column', minWidth: '200px',
              zIndex: 9999, overflow: 'hidden', animation: 'fadeInDown 0.2s ease-out'
            }}>
              <button
                className="dropdown-item"
                onClick={(e) => { e.stopPropagation(); navigate('/profile'); setDropdownOpen(false); }}
              >
                👤 Mi Perfil
              </button>
              <button
                className="dropdown-item dropdown-item--danger"
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
