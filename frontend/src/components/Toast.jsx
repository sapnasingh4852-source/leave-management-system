import React, { useEffect } from 'react';

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
            borderLeft: isSuccess ? '5px solid #10b981' : '5px solid #ef4444',
            border: '1px solid #e5e7eb',
            borderLeftWidth: '5px',
            borderLeftColor: isSuccess ? '#10b981' : '#ef4444',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            minWidth: '300px'
        }}>
            <span style={{ fontSize: '20px' }}>{isSuccess ? '✅' : '⚠️'}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>
                    {isSuccess ? 'Success' : 'Error'}
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563' }}>{message}</div>
            </div>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                ✕
            </button>
        </div>
    );
}

export default Toast;
