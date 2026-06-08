import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import api from '../api/axios';

interface ShiftSwap {
  id: number;
  nombres_solicitante: string;
  nombres_reemplazante: string | null;
  motivo: string;
  estado: string;
  fecha_solicitud: string;
  detalles_turno: {
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    detalles_consultorio: {
      nombre_o_numero: string;
    };
  };
}

export const Swaps = () => {
  const [swaps, setSwaps] = useState<ShiftSwap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSwaps = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const res = await api.get('shifts/swaps/');
      setSwaps(res.data);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
    const interval = setInterval(() => fetchSwaps(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm('¿Confirmas la aprobación de este intercambio? Esto cambiará al médico asignado al turno de forma definitiva.')) return;
    try {
      await api.post(`shifts/swaps/${id}/approve/`);
      fetchSwaps();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al aprobar la permuta.');
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('¿Confirmas el rechazo de esta solicitud?')) return;
    try {
      await api.post(`shifts/swaps/${id}/reject/`);
      fetchSwaps();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al rechazar la permuta.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return <Badge status="yellow">Pendiente (Buscando Reemplazo)</Badge>;
      case 'Aceptado':
        return <Badge status="yellow">Aceptado por Colega</Badge>;
      case 'Aprobado_Admin':
        return <Badge status="green">Aprobado</Badge>;
      case 'Rechazado':
        return <Badge status="red">Rechazado / Vencido</Badge>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-col gap-6" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="flex flex-col-mobile justify-between items-center mb-6" style={{ gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-3xl font-bold">Aprobación de Permutas</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Gestión de intercambios y solicitudes de reemplazo de turnos médicos.</p>
        </div>
      </header>
      
      <GlassCard>
        <Table 
          columns={[
            { header: 'Estado', render: (s) => getStatusBadge(s.estado) },
            { header: 'Médico Solicitante', render: (s) => <span className="font-medium text-gray-900">{s.nombres_solicitante}</span> },
            { header: 'Médico Reemplazante', render: (s) => <span className="text-indigo-600 font-medium">{s.nombres_reemplazante || '- Ninguno -'}</span> },
            { header: 'Turno (Fecha y Hora)', render: (s) => (
                <>
                  {s.detalles_turno.fecha} <br/>
                  <span className="text-xs text-gray-500">{s.detalles_turno.hora_inicio.substring(0,5)} - {s.detalles_turno.hora_fin.substring(0,5)}</span>
                </>
              ) 
            },
            { header: 'Consultorio', render: (s) => s.detalles_turno.detalles_consultorio?.nombre_o_numero || 'N/A' },
            { header: 'Motivo', render: (s) => (
                <div className="max-w-xs truncate text-gray-600" title={s.motivo}>
                  {s.motivo}
                </div>
              ) 
            },
            { header: 'Acciones', render: (s) => (
                <div className="flex justify-end gap-2" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {s.estado === 'Aceptado' && (
                    <>
                      <Button variant="success" size="sm" onClick={() => handleApprove(s.id)} title="Aprobar Permuta">Aprobar</Button>
                      <Button variant="danger" size="sm" onClick={() => handleReject(s.id)} title="Rechazar Permuta">Rechazar</Button>
                    </>
                  )}
                  {s.estado === 'Pendiente' && (
                    <Button variant="danger" size="sm" onClick={() => handleReject(s.id)} title="Anular Solicitud">Anular</Button>
                  )}
                </div>
              ) 
            }
          ]}
          data={swaps}
          emptyMessage="No hay solicitudes de intercambio en el sistema."
        />
      </GlassCard>
    </div>
  );
};
