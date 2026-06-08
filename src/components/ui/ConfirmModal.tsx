import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  confirmVariant = 'danger',
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease-out'
      }}>
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            background: confirmVariant === 'danger' ? '#fee2e2' : confirmVariant === 'success' ? '#d1fae5' : '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {confirmVariant === 'danger' && (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
            )}
            {confirmVariant === 'success' && (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {confirmVariant === 'primary' && (
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{title}</h3>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '28px', paddingLeft: '58px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancelar
          </button>
          <button className={`btn btn-${confirmVariant} btn-sm`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};
