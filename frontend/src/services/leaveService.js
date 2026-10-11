import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://leave-management-system-w7qj.onrender.com/api';

// Helper to construct headers with JWT
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
};

// Create a new leave request
export const createLeave = async (leaveData) => {
    const response = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(leaveData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to apply leave');
    }
    return data;
};

// Get all leaves (user gets own, admin gets all)
export const getLeaves = async () => {
    const response = await fetch(`${API_URL}/leaves`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch leaves');
    }
    return data;
};

// Get a single leave by ID
export const getLeaveById = async (id) => {
    const response = await fetch(`${API_URL}/leaves/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch leave details');
    }
    return data;
};

// Update a leave (Pending only for user)
export const updateLeave = async (id, leaveData) => {
    const response = await fetch(`${API_URL}/leaves/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(leaveData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to update leave');
    }
    return data;
};

// Delete a leave (Pending only for user)
export const deleteLeave = async (id) => {
    const response = await fetch(`${API_URL}/leaves/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete leave');
    }
    return data;
};

// Admin approve leave
export const approveLeave = async (id) => {
    const response = await fetch(`${API_URL}/leaves/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to approve leave');
    }
    return data;
};

// Admin reject leave
export const rejectLeave = async (id) => {
    const response = await fetch(`${API_URL}/leaves/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to reject leave');
    }
    return data;
};
