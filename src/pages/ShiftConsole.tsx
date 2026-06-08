import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const ShiftConsole = () => {
  const days = ["Lun 12", "Mar 13", "Mié 14", "Jue 15", "Vie 16", "Sáb 17", "Dom 18"];
  
  const shifts = [
    { name: "Dr. Carlos Mendoza", status: "green", schedule: ["Mañana", "Tarde", "", "Noche", "", "Mañana", ""] },
    { name: "Dra. Ana López", status: "yellow", schedule: ["", "Noche", "Noche", "", "Tarde", "", "Mañana"] },
    { name: "Dr. Fernando Ruiz", status: "red", schedule: ["Noche", "Noche", "Noche", "Noche", "Noche", "", ""] },
  ];

  return (
    <div className="flex-col gap-6">
      <header className="flex flex-col-mobile justify-between items-center mb-6" style={{ gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-3xl font-bold">Consola de Turnos</h1>
          <p>Planificación visual interactiva (Drag & Drop) y estado de fatiga en tiempo real.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="glass">Semana Anterior</Button>
          <Button variant="glass">Siguiente</Button>
        </div>
      </header>
      
      <GlassCard style={{ padding: '0', overflowX: 'auto' }}>
        <table className="sleek-table" style={{ minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={{ width: '220px' }}>Personal</th>
              {days.map(day => (
                <th key={day} className="text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, idx) => (
              <tr key={idx}>
                <td>
                  <div className="font-bold">{shift.name}</div>
                  <div style={{ marginTop: '8px' }}>
                    <Badge status={shift.status as any} />
                  </div>
                </td>
                {shift.schedule.map((turn, i) => (
                  <td key={i} className="text-center" style={{ padding: '12px 8px' }}>
                    {turn ? (
                      <div style={{ 
                        background: turn === 'Noche' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(37, 99, 235, 0.1)', 
                        color: turn === 'Noche' ? 'white' : 'var(--accent)',
                        padding: '10px 4px', 
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        cursor: 'grab',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {turn}
                      </div>
                    ) : (
                      <div style={{ 
                        padding: '10px 4px', 
                        border: '1px dashed rgba(15, 23, 42, 0.2)', 
                        borderRadius: '6px', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.75rem', 
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.8)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        + Asignar
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
