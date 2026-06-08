import React, { useState } from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({ columns, data, emptyMessage = "No hay datos disponibles" }: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;

  // Reset page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{ padding: '16px 24px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, rowIndex) => (
              <tr 
                key={rowIndex} 
                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} 
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} 
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={{ padding: '16px 24px', color: '#334155', fontSize: '0.95rem' }}>
                    {col.render ? col.render(item) : (col.accessor ? item[col.accessor] as React.ReactNode : null)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Mostrando {data.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, data.length)} de {data.length} registros
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
            Página {currentPage} de {Math.max(1, Math.ceil(data.length / itemsPerPage))}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(data.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.max(1, Math.ceil(data.length / itemsPerPage))}
            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === Math.max(1, Math.ceil(data.length / itemsPerPage)) ? '#f1f5f9' : 'white', color: currentPage === Math.max(1, Math.ceil(data.length / itemsPerPage)) ? '#94a3b8' : '#334155', cursor: currentPage === Math.max(1, Math.ceil(data.length / itemsPerPage)) ? 'not-allowed' : 'pointer' }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
