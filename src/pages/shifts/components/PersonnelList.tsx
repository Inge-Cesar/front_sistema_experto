import React from 'react';
import { GlassCard } from '../../../components/ui/GlassCard';

interface PersonnelListProps {
  personnel: any[];
  onDragStart: (e: React.DragEvent, personId: number) => void;
}

export const PersonnelList: React.FC<PersonnelListProps> = ({ personnel, onDragStart }) => {
  return (
    <GlassCard style={{ padding: '16px', height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
      <h3 style={{ fontWeight: 'bold', marginBottom: '16px', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>Personal Médico</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {personnel.map(p => (
          <div 
            key={p.id} 
            draggable 
            onDragStart={(e) => onDragStart(e, p.id)}
            style={{ 
              padding: '12px', 
              background: 'white', 
              borderRadius: '12px', 
              border: '1px solid rgba(0,0,0,0.05)', 
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            }}
          >
            {p.foto ? (
              <img src={p.foto} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-main)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {p.nombres[0]}{p.apellidos[0]}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem', lineHeight: '1.2', display: 'flex', justifyContent: 'space-between' }}>
                {p.nombres} {p.apellidos}
                {p.disponibilidad_dinamica !== undefined && (
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '12px', background: p.disponibilidad_dinamica > 60 ? '#dcfce7' : p.disponibilidad_dinamica > 30 ? '#fef9c3' : '#fee2e2', color: p.disponibilidad_dinamica > 60 ? '#166534' : p.disponibilidad_dinamica > 30 ? '#a16207' : '#b91c1c' }}>
                    {p.disponibilidad_dinamica}% disp • {p.disponibilidad_dinamica > 60 ? '🟢' : p.disponibilidad_dinamica > 30 ? '🟡' : '🔴'}
                  </span>
                )}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#666' }}>{p.especialidad}</p>
              {!p.apto_nocturno && (
                  <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>No apto Noche</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
