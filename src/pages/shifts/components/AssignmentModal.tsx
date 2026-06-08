import React from 'react';
import { Modal } from '../../../components/ui/Modal';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAssignment: {personnelId: number, dateStr: string} | null;
  personnel: any[];
  newShiftTime: { hora_inicio: string, hora_fin: string };
  setNewShiftTime: (val: { hora_inicio: string, hora_fin: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen, onClose, pendingAssignment, personnel, newShiftTime, setNewShiftTime, onSubmit
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Horario Específico">
      {pendingAssignment && (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '0.9rem' }}>Médico Seleccionado</p>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a', fontSize: '1.1rem' }}>
              {personnel.find(p => p.id === pendingAssignment.personnelId)?.nombres} {personnel.find(p => p.id === pendingAssignment.personnelId)?.apellidos}
            </p>
            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Día: <strong>{pendingAssignment.dateStr}</strong></p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>Hora de Inicio</label>
              <input 
                type="time" 
                required
                value={newShiftTime.hora_inicio} 
                onChange={e => setNewShiftTime({...newShiftTime, hora_inicio: e.target.value})} 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1.2rem', boxSizing: 'border-box', background: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>Hora de Fin</label>
              <input 
                type="time" 
                required
                value={newShiftTime.hora_fin} 
                onChange={e => setNewShiftTime({...newShiftTime, hora_fin: e.target.value})} 
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1.2rem', boxSizing: 'border-box', background: 'white' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '16px' }}>
            ✅ Confirmar Turno
          </button>
        </form>
      )}
    </Modal>
  );
};
