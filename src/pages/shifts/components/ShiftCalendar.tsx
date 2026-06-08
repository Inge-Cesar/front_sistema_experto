import React from 'react';

interface ShiftCalendarProps {
  days: Date[];
  sortedShifts: any[];
  selectedRoomId: number | '';
  onDropToDay: (e: React.DragEvent, dateStr: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDeleteShift: (shiftId: number) => void;
}

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({ 
  days, sortedShifts, selectedRoomId, onDropToDay, onDragOver, onDeleteShift 
}) => {
  return (
    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {days.map((day, idx) => (
              <th key={idx} style={{ padding: '16px', background: '#f8fafc', borderBottom: '2px solid var(--border)', borderRight: idx < 6 ? '1px solid var(--border)' : 'none', width: 'calc(100% / 7)' }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day.getDay()]}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{day.toLocaleDateString()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {days.map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const slotShifts = sortedShifts.filter(s => s.fecha === dateStr && s.consultorio === selectedRoomId);
              
              return (
                <td 
                  key={idx}
                  onDrop={(e) => onDropToDay(e, dateStr)}
                  onDragOver={onDragOver}
                  style={{ 
                    padding: '12px', 
                    borderRight: idx < 6 ? '1px solid var(--border)' : 'none', 
                    verticalAlign: 'top',
                    minHeight: '600px',
                    background: 'white'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '500px' }}>
                    {slotShifts.map(shift => {
                      const isNight = parseInt(shift.hora_inicio.split(':')[0]) >= 18 || parseInt(shift.hora_inicio.split(':')[0]) < 6;
                      return (
                        <div 
                          key={shift.id} 
                          style={{ 
                            padding: '12px', 
                            background: isNight ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            color: isNight ? 'white' : '#1e3a8a',
                            borderRadius: '10px', 
                            border: '1px solid',
                            borderColor: isNight ? '#0f172a' : '#bfdbfe',
                            fontSize: '0.85rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('shiftId', shift.id.toString());
                            e.currentTarget.style.opacity = '0.5';
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          onMouseEnter={(e) => {
                            const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                            if (btn) btn.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={(e) => {
                            const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                            if (btn) btn.style.opacity = '0';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', background: isNight ? 'rgba(255,255,255,0.2)' : 'white', padding: '2px 8px', borderRadius: '12px' }}>
                              {shift.hora_inicio.substring(0,5)} - {shift.hora_fin.substring(0,5)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {shift.detalles_personal?.foto ? (
                              <img src={shift.detalles_personal.foto} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isNight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.6rem' }}>
                                {shift.detalles_personal?.nombres[0]}{shift.detalles_personal?.apellidos[0]}
                              </div>
                            )}
                            <span style={{ fontWeight: '600', lineHeight: '1.2' }}>{shift.detalles_personal?.nombres} {shift.detalles_personal?.apellidos}</span>
                          </div>
                          
                          <button 
                            className="delete-btn"
                            onClick={() => onDeleteShift(shift.id)}
                            style={{
                              position: 'absolute', right: '-8px', top: '-8px', background: '#ef4444', color: 'white',
                              border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: '0',
                              transition: 'opacity 0.2s', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)', zIndex: 10
                            }}
                            title="Eliminar Turno"
                          >
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      );
                    })}
                    {slotShifts.length === 0 && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem', border: '2px dashed #cbd5e1', borderRadius: '10px', background: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }} onDragEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'; }} onDragLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }} onDrop={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}>
                        + Soltar médico aquí
                      </div>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
