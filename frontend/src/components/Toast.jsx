import React, { useEffect } from 'react';
import { IconCheck, IconAlertTriangle, IconClose } from './Icons';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  let bg = '#10B981';
  let border = '#059669';

  if (isError) {
    bg = '#EF4444';
    border = '#DC2626';
  } else if (isWarning) {
    bg = '#F59E0B';
    border = '#D97706';
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 200,
      backgroundColor: bg,
      color: 'white',
      padding: '14px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '450px',
      borderLeft: `6px solid ${border}`
    }} className="animate-slide-up">
      {isError || isWarning ? (
        <IconAlertTriangle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <IconCheck className="w-5 h-5 flex-shrink-0" />
      )}
      <span style={{ fontSize: '0.9rem', fontWeight: '500', flex: 1 }}>
        {toast.message}
      </span>
      <button onClick={onClose} style={{ color: 'white', opacity: 0.8 }}>
        <IconClose className="w-4 h-4" />
      </button>
    </div>
  );
};
