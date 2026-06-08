import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { GlassCard } from '../components/ui/GlassCard';
import { Modal } from '../components/ui/Modal';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface PayrollBreakdown {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  horas: number;
  consultorio: string;
  servicio: string;
  normativa: string;
  tarifa: number;
  bruto: number;
}

interface PayrollPerson {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad: string;
  total_horas: number;
  haber_basico: number;
  ingresos_guardias: number;
  total_pagar: number;
  cant_turnos: number;
  desglose: PayrollBreakdown[];
}

interface PayrollReport {
  mes: number;
  anio: number;
  periodo: string;
  resumen: {
    total_personal: number;
    total_turnos: number;
    total_horas: number;
    total_basicos: number;
    total_guardias: number;
    total_pagar: number;
  };
  prenomina: PayrollPerson[];
}

export const Finance = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`finance/payroll/?month=${month}&year=${year}`);
      setReport(res.data);
    } catch (err: any) {
      setError('Error al obtener el reporte. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const fmtCurrency = (val: number) =>
    `Bs. ${new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`;

  const fmtHours = (h: number) => `${h.toFixed(1)} h`;

  const getBadgeColor = (hours: number) => {
    if (hours >= 40) return { bg: '#fee2e2', color: '#b91c1c' };
    if (hours >= 24) return { bg: '#fef9c3', color: '#a16207' };
    return { bg: '#dcfce7', color: '#166534' };
  };

  const years = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* HEADER */}
      <header style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            💰 Módulo Financiero
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Prenómina calculada automáticamente según las normativas del tarifario vigente.
          </p>
        </div>

        {/* CONTROLES DE PERIODO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px 18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Período:</span>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: '600', background: '#f8fafc', cursor: 'pointer' }}
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', fontWeight: '600', background: '#f8fafc', cursor: 'pointer' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={fetchReport} disabled={loading}>
            {loading ? '⏳' : '🔄'} {loading ? 'Calculando...' : 'Actualizar'}
          </button>
          <div style={{ width: '1px', height: '28px', background: '#e2e8f0', margin: '0 4px' }}></div>
          <button className="btn btn-info btn-sm" onClick={() => setIsCalcModalOpen(true)}>
            ℹ️ Lógica de Cálculo
          </button>
        </div>
      </header>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', color: '#b91c1c', fontWeight: '500' }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI CARDS */}
      {report && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Personal', value: report.resumen.total_personal, icon: '👨‍⚕️', color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Turnos', value: report.resumen.total_turnos, icon: '📅', color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Horas Totales', value: fmtHours(report.resumen.total_horas), icon: '⏱️', color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Gasto Total Nómina', value: fmtCurrency(report.resumen.total_pagar), icon: '💵', color: '#10b981', bg: '#ecfdf5' },
            ].map(kpi => (
              <div key={kpi.label} style={{
                background: 'white', borderRadius: '14px', padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                  <span style={{ fontSize: '1.4rem' }}>{kpi.icon}</span>
                </div>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: kpi.color, lineHeight: 1 }}>{kpi.value}</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {MONTHS[report.mes - 1]} {report.anio}
                </span>
              </div>
            ))}
          </div>

          {/* TABLA DE PRENOMINA */}
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            
            {/* Encabezado de tabla */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                Detalle de Prenómina — {MONTHS[report.mes - 1]} {report.anio}
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', background: '#f8fafc', padding: '4px 12px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                {report.periodo}
              </span>
            </div>

            {/* Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr 40px', gap: '0', padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Profesional Médico', 'Especialidad', 'Cant. Turnos', 'Horas Tot.', 'Total a Pagar', ''].map(h => (
                <span key={h} style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>

            {report.prenomina.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                <p style={{ fontWeight: '600' }}>No hay turnos registrados para este período.</p>
                <p style={{ fontSize: '0.85rem' }}>Agrega turnos en la Consola de Asignación para ver la prenómina.</p>
              </div>
            ) : (
              report.prenomina.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((person, idx) => {
                const badge = getBadgeColor(person.total_horas);
                const isExpanded = expandedId === person.id;

                return (
                  <div key={person.id} style={{ borderBottom: idx < report.prenomina.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    {/* Fila principal */}
                    <div
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr 40px', gap: '0', padding: '16px 24px', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => setExpandedId(isExpanded ? null : person.id)}
                    >
                      {/* Nombre */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, #3b82f6, #8b5cf6)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: '700', fontSize: '0.85rem'
                        }}>
                          {person.nombres[0]}{person.apellidos[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>Dr. {person.nombres} {person.apellidos}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID #{person.id}</div>
                        </div>
                      </div>

                      {/* Especialidad */}
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>{person.especialidad}</span>

                      {/* Turnos */}
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>{person.cant_turnos}</span>

                      {/* Horas con badge de riesgo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{fmtHours(person.total_horas)}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: badge.bg, color: badge.color }}>
                          {person.total_horas >= 40 ? 'SOBRECARGA' : person.total_horas >= 24 ? 'MODERADO' : 'NORMAL'}
                        </span>
                      </div>

                      {/* Monto */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Base: {fmtCurrency(person.haber_basico)}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Guardias: {fmtCurrency(person.ingresos_guardias)}</span>
                        <span style={{ fontWeight: '800', color: '#059669', fontSize: '1.05rem', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '2px' }}>
                          {fmtCurrency(person.total_pagar)}
                        </span>
                      </div>

                      {/* Expandir */}
                      <span style={{ color: '#94a3b8', fontSize: '1.1rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
                    </div>

                    {/* DESGLOSE expandido */}
                    {isExpanded && (
                      <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '0 24px 20px' }}>
                        <div style={{ paddingTop: '16px', marginBottom: '10px', fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                          Desglose de Turnos
                        </div>
                        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          {/* Sub-headers */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '10px 16px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                            {['Fecha', 'Horario', 'Horas', 'Consultorio', 'Tarifa Aplicada', 'Bs./h', 'Total'].map(h => (
                              <span key={h} style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>{h}</span>
                            ))}
                          </div>
                          {person.desglose.map((line, li) => (
                            <div key={li} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '10px 16px', borderBottom: li < person.desglose.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
                              <span style={{ fontWeight: '500', color: '#334155', fontSize: '0.85rem' }}>{line.fecha}</span>
                              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{line.hora_inicio} – {line.hora_fin}</span>
                              <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.85rem' }}>{line.horas.toFixed(1)}h</span>
                              <span style={{ fontSize: '0.8rem', color: '#475569' }}>{line.consultorio}</span>
                              <span style={{ fontSize: '0.78rem', color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: '999px', fontWeight: '600' }}>{line.normativa}</span>
                              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{fmtCurrency(line.tarifa)}</span>
                              <span style={{ fontWeight: '700', color: '#059669', fontSize: '0.88rem' }}>{fmtCurrency(line.bruto)}</span>
                            </div>
                          ))}
                          {/* Subtotal */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 16px', background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                            <span style={{ fontWeight: '700', color: '#166534', fontSize: '0.85rem', gridColumn: '1 / 3' }}>SUBTOTAL</span>
                            <span style={{ fontWeight: '700', color: '#166534' }}>{fmtHours(person.total_horas)}</span>
                            <span></span><span></span><span></span>
                            <span style={{ fontWeight: '800', color: '#059669', fontSize: '0.95rem' }}>{fmtCurrency(person.ingresos_guardias)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Paginación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Mostrando {report.prenomina.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, report.prenomina.length)} de {report.prenomina.length} registros
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
                  Página {currentPage} de {Math.max(1, Math.ceil(report.prenomina.length / itemsPerPage))}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(report.prenomina.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.max(1, Math.ceil(report.prenomina.length / itemsPerPage))}
                  style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === Math.max(1, Math.ceil(report.prenomina.length / itemsPerPage)) ? '#f1f5f9' : 'white', color: currentPage === Math.max(1, Math.ceil(report.prenomina.length / itemsPerPage)) ? '#94a3b8' : '#334155', cursor: currentPage === Math.max(1, Math.ceil(report.prenomina.length / itemsPerPage)) ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente
                </button>
              </div>
            </div>

            {/* TOTAL GLOBAL */}
            {report.prenomina.length > 0 && (
              <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px', alignItems: 'center', borderTop: '2px solid #334155' }}>
                <span style={{ fontWeight: '800', color: 'white', fontSize: '0.95rem' }}>TOTAL PRENÓMINA DEL MES</span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                <span style={{ color: 'white', fontWeight: '700' }}>{report.resumen.total_turnos} turnos</span>
                <span style={{ color: '#fbbf24', fontWeight: '700' }}>{fmtHours(report.resumen.total_horas)}</span>
                <span style={{ color: '#34d399', fontWeight: '800', fontSize: '1.1rem' }}>{fmtCurrency(report.resumen.total_pagar)}</span>
                <span></span>
              </div>
            )}
          </div>

          {/* MODAL LÓGICA DE CÁLCULOS */}
          <Modal isOpen={isCalcModalOpen} onClose={() => setIsCalcModalOpen(false)} title="¿Cómo se calculan estos montos?">
            <div style={{ padding: '10px 0', color: '#334155', maxHeight: '60vh', overflowY: 'auto', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '16px' }}>
                El Motor Financiero cruza la información del Motor Experto Clínico (los turnos) con las <strong>Normativas del Tarifario Vigente</strong> de la siguiente forma:
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>
                  <strong>1. Búsqueda de Tarifario:</strong> Por cada turno asignado (ej. 08:00 a 16:00), el motor busca si existe una normativa financiera configurada para ese lapso de tiempo.
                </li>
                <li>
                  <strong>2. Cálculo de Horas:</strong> Se restan las horas de fin e inicio del turno. (Turnos que cruzan la medianoche suman 24h al fin para el cálculo).
                </li>
                <li>
                  <strong>3. Multiplicación de Tarifa:</strong> Se multiplica la cantidad de horas resultantes por el monto por hora (Bs./h) estipulado en la normativa.
                </li>
                <li>
                  <strong>4. Total Bruto (Subtotal):</strong> Se suman todos los bloques individuales para obtener el ingreso bruto del médico en el mes.
                </li>
              </ul>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                <strong>💡 Nota:</strong> Si un turno se cruza entre dos tarifas distintas (ej. Diurna y Nocturna), el sistema aplicará la normativa que coincida con la hora de inicio del turno.
              </div>
            </div>
          </Modal>

          {/* NOTA LEGAL */}
          <div style={{ marginTop: '20px', padding: '14px 18px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <div>
              <span style={{ fontWeight: '700', color: '#92400e', fontSize: '0.85rem' }}>Nota Legal: </span>
              <span style={{ color: '#78350f', fontSize: '0.82rem' }}>
                Este reporte es una prenómina estimada generada automáticamente por el Motor Experto.
                Los montos finales deben ser validados por el área de Recursos Humanos antes de su pago.
                Las tarifas aplicadas corresponden a las normativas configuradas en el módulo de Configuración.
              </span>
            </div>
          </div>
        </>
      )}

      {loading && !report && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#64748b', fontWeight: '500' }}>Calculando prenómina...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
};
