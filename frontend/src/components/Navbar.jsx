import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';

function Navbar() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const getNavLinkStyle = ({ isActive }) => ({
        ...styles.link,
        color: isActive ? '#ffffff' : '#d1d5db',
        fontWeight: isActive ? '600' : '500',
        borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        padding: '6px 12px',
        borderRadius: '6px'
    });

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to log out of LeaveMS?');
        if (confirmed) {
            logout();
            navigate('/login');
        }
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    🏢 LeaveMS
                </Link>

                <div style={styles.links}>
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <NavLink to="/admin" style={getNavLinkStyle}>
                                    Admin Dashboard
                                </NavLink>
                            ) : (
                                <>
                                    <NavLink to="/dashboard" style={getNavLinkStyle}>
                                        My Dashboard
                                    </NavLink>
                                    <NavLink to="/apply-leave" style={getNavLinkStyle}>
                                        Apply Leave
                                    </NavLink>
                                </>
                            )}

                            <span style={styles.userInfo}>
                                👤 {user.name} ({user.role})
                            </span>

                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" style={getNavLinkStyle}>
                                Login
                            </NavLink>
                            <Link to="/register" style={styles.registerBtn}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        backgroundColor: '#1f2937',
        color: '#ffffff',
        padding: '14px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '20px',
        fontWeight: 'bold',
        letterSpacing: '0.5px'
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    link: {
        color: '#d1d5db',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '500'
    },
    userInfo: {
        fontSize: '14px',
        color: '#9ca3af',
        marginLeft: '8px'
    },
    logoutBtn: {
        backgroundColor: '#ef4444',
        color: '#ffffff',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    registerBtn: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        textDecoration: 'none',
        padding: '6px 14px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500'
    }
};

export default Navbar;
