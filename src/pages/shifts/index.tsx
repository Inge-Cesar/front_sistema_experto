import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { PersonnelList } from './components/PersonnelList';
import { ShiftCalendar } from './components/ShiftCalendar';
import { AssignmentModal } from './components/AssignmentModal';
import { Modal } from '../../components/ui/Modal';

export const Shifts: React.FC = () => {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<{personnelId: number, dateStr: string} | null>(null);
  const [newShiftTime, setNewShiftTime] = useState({ hora_inicio: '08:00', hora_fin: '16:00' });

  useEffect(() => {
    fetchPersonnel();
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [currentWeekStart]);

  function getStartOfWeek(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const fetchPersonnel = async () => {
    try {
      const response = await api.get('personnel/');
      setPersonnel(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('config/rooms/');
      setRooms(res.data);
      if (res.data.length > 0) {
        setSelectedRoomId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShifts = async () => {
    try {
      const start = currentWeekStart.toISOString().split('T')[0];
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      const endStr = end.toISOString().split('T')[0];
      
      const response = await api.get(`shifts/?start_date=${start}&end_date=${endStr}`);
      setShifts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const changeWeek = (offset: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (offset * 7));
    setCurrentWeekStart(newStart);
  };

  const handleDragStart = (e: React.DragEvent, personId: number) => {
    e.dataTransfer.setData('personnelId', personId.toString());
  };

  const handleDropToDay = async (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (!selectedRoomId) {
      showToast('Debes seleccionar un Consultorio primero', 'error');
      return;
    }

    const shiftId = e.dataTransfer.getData('shiftId');
    if (shiftId) {
      try {
        const response = await api.patch(`shifts/${shiftId}/`, { fecha: dateStr });
        setShifts(shifts.map(s => s.id.toString() === shiftId ? response.data : s));
        showToast('Turno reprogramado exitosamente', 'success');
      } catch (err: any) {
        if (err.response?.data?.rechazo_motor_experto) {
          showToast(err.response.data.rechazo_motor_experto, 'error');
        } else if (err.response?.data?.expert_system_rejection) {
          showToast(err.response.data.expert_system_rejection, 'error');
        } else {
          showToast('El Motor Experto bloqueó el cambio de turno (violación de reglas).', 'error');
        }
      }
      return;
    }

    const personId = e.dataTransfer.getData('personnelId');
    if (!personId) return;

    setPendingAssignment({ personnelId: Number(personId), dateStr });
    setNewShiftTime({ hora_inicio: '08:00', hora_fin: '16:00' });
    setIsAssignmentModalOpen(true);
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingAssignment || !selectedRoomId) return;

    try {
      const response = await api.post('shifts/', {
        personal: pendingAssignment.personnelId,
        consultorio: selectedRoomId,
        fecha: pendingAssignment.dateStr,
        hora_inicio: newShiftTime.hora_inicio,
        hora_fin: newShiftTime.hora_fin
      });
      setShifts([...shifts, response.data]);
      showToast('Turno asignado correctamente', 'success');
      setIsAssignmentModalOpen(false);
      setPendingAssignment(null);
    } catch (err: any) {
      if (err.response?.data?.rechazo_motor_experto) {
        showToast(err.response.data.rechazo_motor_experto, 'error');
      } else if (err.response?.data?.expert_system_rejection) {
        showToast(err.response.data.expert_system_rejection, 'error');
      } else if (err.response?.data?.non_field_errors) {
         showToast("El médico ya tiene asignado un turno solapado este día.", 'error');
      } else {
        showToast('Error al asignar el turno', 'error');
      }
    }
  };

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return;
    try {
      await api.delete(`shifts/${shiftToDelete}/`);
      setShifts(shifts.filter(s => s.id !== shiftToDelete));
      showToast('Guardia eliminada correctamente', 'success');
    } catch (err) {
      showToast('Error al eliminar la guardia', 'error');
    } finally {
      setShiftToDelete(null);
    }
  };

  const handleAutoSchedule = async () => {
    if (!selectedRoomId) {
      showToast('Debes seleccionar un Consultorio primero', 'error');
      return;
    }
    
    setIsAutoScheduling(true);
    try {
      const startStr = currentWeekStart.toISOString().split('T')[0];
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      const endStr = end.toISOString().split('T')[0];
      
      const response = await api.post('shifts/auto_schedule/', {
        consultorio: selectedRoomId,
        start_date: startStr,
        end_date: endStr
      });
      
      showToast(response.data.mensaje || 'Turnos generados correctamente', 'success');
      if (response.data.explicaciones) {
        setExplanations(response.data.explicaciones);
        setIsExplanationModalOpen(true);
      }
      await fetchShifts();
    } catch (err) {
      console.error(err);
      showToast('Error al generar turnos automáticos', 'error');
    } finally {
      setIsAutoScheduling(false);
    }
  };

  const handleExportCSV = () => {
    if (shifts.length === 0) return showToast('No hay turnos para exportar', 'error');
    let csv = 'ID,Medico,Especialidad,Consultorio,Fecha,Inicio,Fin\n';
    shifts.forEach(s => {
      csv += `${s.id},"${s.detalles_personal?.nombres} ${s.detalles_personal?.apellidos}","${s.detalles_personal?.especialidad}","${s.detalles_consultorio?.nombre_o_numero}",${s.fecha},${s.hora_inicio},${s.hora_fin}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turnos_${currentWeekStart.toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportXML = () => {
    if (shifts.length === 0) return showToast('No hay turnos para exportar', 'error');
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<turnos>\n';
    shifts.forEach(s => {
      xml += `  <turno id="${s.id}">\n`;
      xml += `    <medico>${s.detalles_personal?.nombres} ${s.detalles_personal?.apellidos}</medico>\n`;
      xml += `    <especialidad>${s.detalles_personal?.especialidad}</especialidad>\n`;
      xml += `    <consultorio>${s.detalles_consultorio?.nombre_o_numero}</consultorio>\n`;
      xml += `    <fecha>${s.fecha}</fecha>\n`;
      xml += `    <hora_inicio>${s.hora_inicio}</hora_inicio>\n`;
      xml += `    <hora_fin>${s.hora_fin}</hora_fin>\n`;
      xml += `  </turno>\n`;
    });
    xml += '</turnos>';
    const blob = new Blob([xml], { type: 'text/xml;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turnos_${currentWeekStart.toISOString().split('T')[0]}.xml`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const sortedShifts = [...shifts].sort((a, b) => {
    if (a.hora_inicio < b.hora_inicio) return -1;
    if (a.hora_inicio > b.hora_inicio) return 1;
    return 0;
  });

  return (
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
          <div style={{ minWidth: '300px' }}>
            <h1 className="text-2xl font-bold text-primary">Consola de Asignación de Turnos</h1>
            <p style={{ color: '#666' }}>Arrastra un médico hacia el día deseado para establecer su horario de guardia.</p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>

            <button
              className="btn btn-ai btn-sm"
              onClick={handleAutoSchedule}
              disabled={isAutoScheduling}
            >
              {isAutoScheduling ? '⏳ Calculando...' : '🪄 Auto-Sugerencia'}
            </button>

            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value === 'csv') handleExportCSV();
                if (e.target.value === 'xml') handleExportXML();
                e.target.value = ''; // Resetear al valor por defecto
              }}
              style={{
                padding: '6px 12px', borderRadius: '8px',
                border: '1px solid #e2e8f0', fontWeight: '500', outline: 'none',
                background: 'white', color: '#475569', cursor: 'pointer', fontSize: '0.85rem'
              }}
            >
              <option value="" disabled>📥 Exportar...</option>
              <option value="csv">📄 a Excel (CSV)</option>
              <option value="xml">📄 a XML</option>
            </select>

            <div style={{ width: '1px', height: '28px', background: '#e2e8f0', margin: '0 4px' }}></div>

            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
              style={{
                padding: '8px 12px', borderRadius: '8px',
                border: '1.5px solid #c7d2fe', fontWeight: '600', outline: 'none',
                background: '#f0f4ff', color: '#3730a3', cursor: 'pointer', fontSize: '0.85rem'
              }}
            >
              {rooms.length === 0 ? <option value="">Crear Consultorio en Configuración</option> : null}
              {rooms.map(r => <option key={r.id} value={r.id}>{r.nombre_o_numero} — {r.detalles_servicio?.nombre}</option>)}
            </select>

            <div style={{ width: '1px', height: '28px', background: '#e2e8f0', margin: '0 4px' }}></div>

            <button className="btn btn-ghost btn-sm" onClick={() => changeWeek(-1)}>← Anterior</button>
            <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#475569', minWidth: '160px', textAlign: 'center' }}>
              {days[0].toLocaleDateString('es', { day: '2-digit', month: 'short' })} – {days[6].toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => changeWeek(1)}>Siguiente →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px' }}>
          <PersonnelList personnel={personnel} onDragStart={handleDragStart} />
          
          <ShiftCalendar 
            days={days} 
            sortedShifts={sortedShifts} 
            selectedRoomId={selectedRoomId as number} 
            onDropToDay={handleDropToDay} 
            onDragOver={handleDragOver} 
            onDeleteShift={(shiftId) => setShiftToDelete(shiftId)} 
          />
        </div>

        <AssignmentModal 
          isOpen={isAssignmentModalOpen} 
          onClose={() => {setIsAssignmentModalOpen(false); setPendingAssignment(null);}} 
          pendingAssignment={pendingAssignment} 
          personnel={personnel} 
          newShiftTime={newShiftTime} 
          setNewShiftTime={setNewShiftTime} 
          onSubmit={handleConfirmAssignment} 
        />

        {toast && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px', background: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex', alignItems: 'center', gap: '12px', zIndex: 9999, maxWidth: '400px'
          }}>
            <span style={{ fontWeight: '500' }}>{toast.message}</span>
          </div>
        )}

        <ConfirmModal 
          isOpen={shiftToDelete !== null}
          title="Eliminar Guardia"
          message="¿Estás completamente seguro de que deseas eliminar este turno? Esta acción dejará la vacante libre en el hospital y no se puede deshacer."
          onConfirm={handleDeleteShift}
          onCancel={() => setShiftToDelete(null)}
        />

      <Modal isOpen={isExplanationModalOpen} onClose={() => setIsExplanationModalOpen(false)} title="Diagnóstico de Asignación de la IA 🕵️‍♂️">
        <div style={{ padding: '10px 0', color: '#334155', maxHeight: '60vh', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>
            Registro detallado de la evaluación del Motor Experto:
          </p>
          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', color: '#f8fafc', whiteSpace: 'pre-wrap' }}>
            {explanations.map((exp, idx) => {
              let color = '#cbd5e1';
              if (exp.startsWith('✅')) color = '#34d399';
              if (exp.startsWith('❌')) color = '#f87171';
              if (exp.includes('--- Evaluando')) color = '#60a5fa';
              return <div key={idx} style={{ color, marginBottom: '4px' }}>{exp.replace('\\n', '')}</div>;
            })}
          </div>
        </div>
      </Modal>

    </div>
  );
};
