import React from 'react';

function Spinner({ message = 'Loading leave applications...' }) {
    return (
        <div style={styles.container}>
            <div style={styles.spinner} className="lms-spinner" />
            <p style={styles.text}>{message}</p>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '14px'
    },
    spinner: {
        width: '42px',
        height: '42px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%'
    },
    text: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#4b5563',
        margin: 0
    }
};

export default Spinner;
