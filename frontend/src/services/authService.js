// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'https://leave-management-system-w7qj.onrender.com/api';

// Register user
export const register = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
    }
    return data;
};

// Login user
export const login = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }
    return data;
};

// Logout helper: removes auth info from localStorage
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Get current user stored in localStorage
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

// Get stored JWT token
export const getToken = () => {
    return localStorage.getItem('token');
};
