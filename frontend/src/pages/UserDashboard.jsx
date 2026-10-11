import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLeaves, deleteLeave } from '../services/leaveService';
import { getCurrentUser } from '../services/authService';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';

function UserDashboard() {
    const user = getCurrentUser();
    const [leaves, setLeaves] = useState([]);
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const filteredLeaves = leaveTypeFilter === 'All'
        ? leaves
        : leaves.filter((l) => l.leaveType === leaveTypeFilter);

    const fetchUserLeaves = async () => {
        try {
            setLoading(true);
            const data = await getLeaves();
            setLeaves(data);
        } catch (err) {
            setError(err.message || 'Failed to load leaves');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserLeaves();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this pending leave application? This action cannot be undone.'
        );
        if (!confirmed) return;

        try {
            await deleteLeave(id);
            setSuccessMessage('Leave application deleted successfully');
            // Remove deleted leave from local state
            setLeaves(leaves.filter((leave) => leave._id !== id));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to delete leave');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Welcome, {user?.name || 'Employee'}! 👋</h1>
                    <p style={styles.subtitle}>Here is the overview of all your leave applications.</p>
                </div>
                <Link to="/apply-leave" style={styles.applyBtn}>
                    + Apply For Leave
                </Link>
            </div>

            <Toast
                message={successMessage || error}
                type={successMessage ? 'success' : 'error'}
                onClose={() => { setSuccessMessage(''); setError(''); }}
            />

            {loading ? (
                <Spinner message="Loading your leave applications..." />
            ) : leaves.length === 0 ? (
                <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '60px 24px',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    maxWidth: '600px',
                    margin: '30px auto'
                }}>
                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>📅</div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                        No Leave Applications Yet
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                        You haven't submitted any leave requests so far. Click the button below to submit your first leave application.
                    </p>
                    <Link
                        to="/apply-leave"
                        style={{
                            ...styles.applyBtn,
                            display: 'inline-block',
                            padding: '12px 24px',
                            fontSize: '15px'
                        }}
                    >
                        + Apply For Your First Leave
                    </Link>
                </div>
            ) : (
                <div style={styles.tableCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderBottom: '1px solid #e5e7eb' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Filter by Leave Type:</label>
                        <select
                            value={leaveTypeFilter}
                            onChange={(e) => setLeaveTypeFilter(e.target.value)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#ffffff' }}
                        >
                            <option value="All">All Leave Types</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Earned Leave">Earned Leave</option>
                            <option value="Emergency Leave">Emergency Leave</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Leave Type</th>
                                <th style={styles.th}>From Date</th>
                                <th style={styles.th}>To Date</th>
                                <th style={styles.th}>Reason</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.map((leave) => (
                                <tr key={leave._id} style={styles.tr}>
                                    <td style={{ ...styles.td, fontWeight: '600' }}>{leave.leaveType}</td>
                                    <td style={styles.td}>
                                        {new Date(leave.fromDate).toLocaleDateString()}
                                    </td>
                                    <td style={styles.td}>
                                        {new Date(leave.toDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ ...styles.td, maxWidth: '250px' }}>{leave.reason}</td>
                                    <td style={styles.td}>
                                        <StatusBadge status={leave.status} />
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actionGroup}>
                                            <Link to={`/leaves/${leave._id}`} style={styles.viewLink}>
                                                View
                                            </Link>
                                            {leave.status === 'Pending' && (
                                                <>
                                                    <Link to={`/leaves/${leave._id}/edit`} style={styles.editLink}>
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(leave._id)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#111827',
        margin: '0 0 6px 0'
    },
    subtitle: {
        fontSize: '15px',
        color: '#6b7280',
        margin: 0
    },
    applyBtn: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        textDecoration: 'none',
        padding: '10px 18px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '14px'
    },
    errorAlert: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '16px'
    },
    successAlert: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '16px'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280'
    },
    emptyState: {
        textAlign: 'center',
        padding: '50px 20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    tableCard: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
    },
    thRow: {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
    },
    th: {
        padding: '14px 16px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#4b5563',
        textTransform: 'uppercase'
    },
    tr: {
        borderBottom: '1px solid #f3f4f6'
    },
    td: {
        padding: '14px 16px',
        fontSize: '14px',
        color: '#374151'
    },
    actionGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    viewLink: {
        color: '#2563eb',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: '600'
    },
    editLink: {
        color: '#d97706',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: '600'
    },
    deleteBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#dc2626',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: 0
    }
};

export default UserDashboard;