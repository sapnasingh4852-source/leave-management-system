import React from 'react';

function LeaveForm({ initialData, onSubmit, submitButtonText = 'Submit', isSubmitting = false }) {
    const [leaveType, setLeaveType] = React.useState(initialData?.leaveType || 'Sick Leave');
    const [fromDate, setFromDate] = React.useState(initialData?.fromDate ? initialData.fromDate.substring(0, 10) : '');
    const [toDate, setToDate] = React.useState(initialData?.toDate ? initialData.toDate.substring(0, 10) : '');
    const [reason, setReason] = React.useState(initialData?.reason || '');
    const [error, setError] = React.useState('');

    // Pre-fill form when initialData changes (e.g. on edit fetch)
    React.useEffect(() => {
        if (initialData) {
            if (initialData.leaveType) setLeaveType(initialData.leaveType);
            if (initialData.fromDate) setFromDate(initialData.fromDate.substring(0, 10));
            if (initialData.toDate) setToDate(initialData.toDate.substring(0, 10));
            if (initialData.reason) setReason(initialData.reason);
        }
    }, [initialData]);

    const todayStr = new Date().toISOString().split('T')[0];

    const handleSubmit = (e) => {
        if (fromDate < todayStr) {
            setError('From Date cannot be earlier than today.');
            return;
        }
        e.preventDefault();
        setError('');

        if (!leaveType || !fromDate || !toDate || !reason.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        if (new Date(toDate) < new Date(fromDate)) {
            setError('To Date cannot be earlier than From Date.');
            return;
        }

        onSubmit({
            leaveType,
            fromDate,
            toDate,
            reason
        });
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.errorAlert}>{error}</div>}

            <div style={styles.formGroup}>
                <label style={styles.label}>Leave Type</label>
                <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    style={styles.select}
                    required
                >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div style={styles.row}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        min={todayStr}
                        onChange={(e) => setFromDate(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>

                <div style={{ ...styles.formGroup, flex: 1 }}>
                    <label style={styles.label}>To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        min={fromDate || todayStr}
                        onChange={(e) => setToDate(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Reason for Leave</label>
                <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe why you are requesting leave..."
                    style={styles.textarea}
                    required
                />
            </div>

            <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                {isSubmitting ? 'Saving...' : submitButtonText}
            </button>
        </form>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    errorAlert: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: '14px'
    },
    row: {
        display: 'flex',
        gap: '16px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
    },
    input: {
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px'
    },
    select: {
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: '#ffffff'
    },
    textarea: {
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical'
    },
    submitBtn: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        padding: '12px 18px',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px'
    }
};

export default LeaveForm;
