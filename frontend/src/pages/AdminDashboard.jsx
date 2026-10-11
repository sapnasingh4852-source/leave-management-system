import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLeaves, approveLeave, rejectLeave, deleteLeave } from '../services/leaveService';
import StatusBadge from '../components/StatusBadge';

function AdminDashboard() {
    const [leaves, setLeaves] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const filteredLeaves = statusFilter === 'All'
        ? leaves
        : leaves.filter((l) => l.status === statusFilter);

    const fetchAllLeaves = async () => {
        try {
            setLoading(true);
            const data = await getLeaves();
            setLeaves(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch leaves');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllLeaves();
    }, []);

    // Approve leave handler
    const handleApprove = async (id) => {
        try {
            const result = await approveLeave(id);
            setSuccessMessage('Leave application approved successfully');
            // Update the leave in state
            setLeaves(leaves.map((l) => (l._id === id ? result.leave : l)));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to approve leave');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Reject leave handler
    const handleReject = async (id) => {
        try {
            const result = await rejectLeave(id);
            setSuccessMessage('Leave application rejected successfully');
            setLeaves(leaves.map((l) => (l._id === id ? result.leave : l)));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to reject leave');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Delete leave handler
    const handleDelete = async (id) => {
        try {
            await deleteLeave(id);
            setSuccessMessage('Leave record deleted successfully');
            setLeaves(leaves.filter((l) => l._id !== id));
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
                    <h1 style={styles.title}>Admin Dashboard 🛡️</h1>
                    <p style={styles.subtitle}>Review and manage leave applications from all employees</p>
                </div>
            </div>

            {error && <div style={styles.errorAlert}>{error}</div>}
            {successMessage && <div style={styles.successAlert}>{successMessage}</div>}

            {loading ? (
                <div style={styles.loading}>Loading all leave applications...</div>
            ) : leaves.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>
                        No leave applications found in the system.
                    </p>
                </div>
            ) : (
                <div style={styles.tableCard}>
                    <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
                        {['All', 'Pending', 'Approved', 'Rejected'].map((status) => {
                            const count = status === 'All' ? leaves.length : leaves.filter((l) => l.status === status).length;
                            const isActive = statusFilter === status;
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setStatusFilter(status)}
                                    style={{
                                        padding: '7px 16px',
                                        borderRadius: '20px',
                                        border: isActive ? '1px solid #2563eb' : '1px solid #d1d5db',
                                        backgroundColor: isActive ? '#2563eb' : '#ffffff',
                                        color: isActive ? '#ffffff' : '#374151',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {status} ({count})
                                </button>
                            );
                        })}
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Employee</th>
                                <th style={styles.th}>Leave Type</th>
                                <th style={styles.th}>Dates</th>
                                <th style={styles.th}>Reason</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Applied On</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.map((leave) => (
                                <tr key={leave._id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>
                                            {leave.employee?.name || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {leave.employee?.email || 'No email'}
                                        </div>
                                    </td>
                                    <td style={styles.td}>{leave.leaveType}</td>
                                    <td style={styles.td}>
                                        <div style={{ fontSize: '13px' }}>
                                            {new Date(leave.fromDate).toLocaleDateString()} -{' '}
                                            {new Date(leave.toDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ ...styles.td, maxWidth: '200px' }}>{leave.reason}</td>
                                    <td style={styles.td}>
                                        <StatusBadge status={leave.status} />
                                    </td>
                                    <td style={{ ...styles.td, fontSize: '12px', color: '#6b7280' }}>
                                        {new Date(leave.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actionGroup}>
                                            <Link to={`/leaves/${leave._id}`} style={styles.viewLink}>
                                                View
                                            </Link>

                                            {leave.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(leave._id)}
                                                        style={styles.approveBtn}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(leave._id)}
                                                        style={styles.rejectBtn}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => handleDelete(leave._id)}
                                                style={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
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
        marginBottom: '24px'
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
        gap: '8px',
        flexWrap: 'wrap'
    },
    viewLink: {
        color: '#2563eb',
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: '600'
    },
    approveBtn: {
        backgroundColor: '#16a34a',
        color: '#ffffff',
        border: 'none',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    rejectBtn: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
        border: 'none',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    deleteBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#6b7280',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer'
    }
};

export default AdminDashboard;
