import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const Dashboard = () => {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('personnel/');
        setPersonnel(res.data);
      } catch (err) {
        console.error("Error fetching personnel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const aptos = personnel.filter(p => p.disponibilidad_dinamica > 60).length;
  const precaucion = personnel.filter(p => p.disponibilidad_dinamica > 30 && p.disponibilidad_dinamica <= 60).length;
  const riesgo = personnel.filter(p => p.disponibilidad_dinamica <= 30).length;

  return (
    <div className="flex-col gap-6" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="flex flex-col-mobile justify-between items-center mb-6" style={{ gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-3xl font-bold">Consola de Turnos Inteligente</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Motor Experto Activo. Sistema operativo y monitorizando fatiga en tiempo real.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/shifts')}>
          <span className="flex-row gap-2" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Ir a Asignación de Turnos
          </span>
        </Button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando datos en tiempo real...</div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <GlassCard style={{ textAlign: 'center', padding: '24px' }}>
              <h3 style={{ fontSize: '3rem', fontWeight: '800', color: '#10b981', lineHeight: '1' }}>{aptos}</h3>
              <p style={{ fontWeight: '600', color: '#64748b', marginTop: '8px' }}>Médicos Aptos</p>
            </GlassCard>
            <GlassCard style={{ textAlign: 'center', padding: '24px' }}>
              <h3 style={{ fontSize: '3rem', fontWeight: '800', color: '#f59e0b', lineHeight: '1' }}>{precaucion}</h3>
              <p style={{ fontWeight: '600', color: '#64748b', marginTop: '8px' }}>En Precaución</p>
            </GlassCard>
            <GlassCard style={{ textAlign: 'center', padding: '24px' }}>
              <h3 style={{ fontSize: '3rem', fontWeight: '800', color: '#ef4444', lineHeight: '1' }}>{riesgo}</h3>
              <p style={{ fontWeight: '600', color: '#64748b', marginTop: '8px' }}>Bloqueados (Riesgo)</p>
            </GlassCard>
          </div>

          <h2 className="text-2xl font-bold mb-6 mt-4" style={{ color: '#0f172a' }}>Personal Médico (En Vivo)</h2>
          
          <div className="flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {personnel.length === 0 ? (
              <p style={{ color: '#64748b' }}>No hay personal registrado en el sistema.</p>
            ) : (
              personnel.map(p => {
                const disp = p.disponibilidad_dinamica;
                const isRed = disp <= 30;
                const isYellow = disp > 30 && disp <= 60;
                const colorHex = isRed ? '#ef4444' : isYellow ? '#f59e0b' : '#10b981';
                
                return (
                  <GlassCard key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderLeft: `6px solid ${colorHex}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {p.foto ? (
                        <img src={p.foto} alt="Avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', color: colorHex, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          {p.nombres[0]}{p.apellidos[0]}
                        </div>
                      )}
                      <div className="flex-col">
                        <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>Dr(a). {p.nombres} {p.apellidos}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                          {p.especialidad} • Horas Asignadas (Esta Semana): <strong>{p.horas_asignadas}h</strong> / {p.horas_max_semanales}h
                          {p.turnos_nocturnos > 0 && <span style={{ color: '#8b5cf6', marginLeft: '8px' }}>({p.turnos_nocturnos} Turno(s) Nocturno(s))</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disponibilidad / Fatiga</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: colorHex }}>
                          {disp}% — {p.puntos_estres} pts
                        </div>
                      </div>
                      <Badge status={isRed ? "red" : isYellow ? "yellow" : "green"} />
                      {isRed && (
                        <Button variant="glass" style={{ marginLeft: '8px', fontSize: '0.8rem' }}>Forzar (Req. Auditoría)</Button>
                      )}
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
