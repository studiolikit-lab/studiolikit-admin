import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, List, LogOut } from 'lucide-react';

const AdminLayout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'DashBoard', icon: <LayoutDashboard size={20} /> },
        { path: '/categories', label: 'Categories', icon: <List size={20} /> },
        { path: '/upload', label: 'Upload Video', icon: <Upload size={20} /> },
    ];

    return (
        <div className="admin-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="nav-menu">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main className="content">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
