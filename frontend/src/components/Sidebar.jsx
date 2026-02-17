import React from 'react';
import {
    DashboardIcon,
    TicketIcon,
    PlusIcon,
    BrainIcon,
    SettingsIcon,
    UserIcon
} from './Icons';

const Sidebar = ({ activeView, setActiveView }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Analytics', icon: DashboardIcon },
        { id: 'tickets', label: 'All Tickets', icon: TicketIcon },
        { id: 'create', label: 'Create Ticket', icon: PlusIcon },
        { id: 'ai-triage', label: 'AI Triage', icon: BrainIcon },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <aside className="app-sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon-box">
                    <TicketIcon color="white" size={20} />
                </div>
                <span className="logo-text">NexusKit</span>
            </div>

            <div className="nav-section">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id ||
                        (activeView === 'tickets' && item.id === 'tickets') ||
                        (activeView === 'dashboard' && item.id === 'dashboard');

                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveView(item.id)}
                        >
                            <Icon />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto' }}>
                <button className="nav-item">
                    <UserIcon />
                    <span>Jane Doe</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
