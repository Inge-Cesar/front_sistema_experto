import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { GlassCard } from '../components/ui/GlassCard';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AuditLog {
  id: number;
  usuario_nombre: string;
  accion: string;
  detalles: string;
  motivo?: string | null;
  nivel_severidad: 'INFO' | 'ADVERTENCIA' | 'CRITICO';
  fecha: string;
}

export const Audit = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('audit/logs/');
        // La API puede devolver un array directo o un objeto paginado { results: [] }
        const data = res.data;
        if (Array.isArray(data)) {
          setLogs(data);
        } else if (data && Array.isArray(data.results)) {
          setLogs(data.results);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error("Error al obtener auditoría", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const downloadCSV = () => {
    const headers = ['ID', 'Fecha', 'Nivel', 'Acción', 'Usuario', 'Detalles', 'Motivo'];
    const rows = logs.map(l => [
      l.id,
      new Date(l.fecha).toLocaleString(),
      l.nivel_severidad,
      l.accion,
      l.usuario_nombre,
      `"${l.detalles}"`,
      `"${l.motivo || ''}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_hospital_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Auditoría', 14, 22);
    doc.setFontSize(11);
    doc.text(`Fecha del Reporte: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Fecha", "Nivel", "Acción", "Usuario", "Detalles", "Motivo"];
    const tableRows: any[] = [];

    logs.forEach(log => {
      const rowData = [
        new Date(log.fecha).toLocaleString(),
        log.nivel_severidad,
        log.accion,
        log.usuario_nombre,
        log.detalles,
        log.motivo || 'N/A'
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        4: { cellWidth: 80 } // Ancho mayor para los detalles
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 1) { // Color por nivel
          if (data.cell.raw === 'CRITICO') {
            data.cell.styles.textColor = [185, 28, 28]; // Rojo
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.raw === 'ADVERTENCIA') {
            data.cell.styles.textColor = [161, 98, 7]; // Amarillo
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    doc.save(`auditoria_hospital_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getColor = (level: string) => {
    switch(level) {
      case 'CRITICO': return '#fee2e2';
      case 'ADVERTENCIA': return '#fef9c3';
      default: return '#f1f5f9';
    }
  };

  const getTextColor = (level: string) => {
    switch(level) {
      case 'CRITICO': return '#b91c1c';
      case 'ADVERTENCIA': return '#a16207';
      default: return '#475569';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            🛡️ Reportes y Auditoría
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Registro inmutable de acciones críticas y asignaciones en el sistema.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={downloadCSV} disabled={logs.length === 0} style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '8px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Exportar a CSV
          </button>
          <button className="btn btn-primary" onClick={downloadPDF} disabled={logs.length === 0} style={{ background: '#ef4444', border: 'none', color: 'white' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '8px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            Exportar a PDF
          </button>
        </div>
      </header>

      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando registros...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No hay registros de auditoría en el sistema.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '700' }}>Fecha y Hora</th>
                  <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '700' }}>Nivel</th>
                  <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '700' }}>Acción</th>
                  <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '700' }}>Usuario</th>
                  <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '700' }}>Detalles</th>
                  <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '700' }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', background: getColor(log.nivel_severidad) }}>
                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', color: '#334155', fontWeight: '500' }}>
                      {new Date(log.fecha).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.6)', padding: '4px 8px', borderRadius: '6px', color: getTextColor(log.nivel_severidad), fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {log.nivel_severidad}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a' }}>{log.accion}</td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>{log.usuario_nombre}</td>
                    <td style={{ padding: '16px 20px', color: '#475569', maxWidth: '300px' }}>{log.detalles}</td>
                    <td style={{ padding: '16px 20px', color: '#475569', fontStyle: 'italic', maxWidth: '200px' }}>{log.motivo || <span style={{color: '#cbd5e1'}}>-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Mostrando {logs.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, logs.length)} de {logs.length} registros
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
              Página {currentPage} de {Math.max(1, Math.ceil(logs.length / itemsPerPage))}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(logs.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.max(1, Math.ceil(logs.length / itemsPerPage))}
              style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === Math.max(1, Math.ceil(logs.length / itemsPerPage)) ? '#f1f5f9' : 'white', color: currentPage === Math.max(1, Math.ceil(logs.length / itemsPerPage)) ? '#94a3b8' : '#334155', cursor: currentPage === Math.max(1, Math.ceil(logs.length / itemsPerPage)) ? 'not-allowed' : 'pointer' }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
