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
        <aside className="w-64 bg-sidebar-bg border-r border-border-subtle flex flex-col p-6 flex-shrink-0">
            <div className="flex items-center gap-3 mb-10 pl-1">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <TicketIcon color="white" size={20} />
                </div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    NexusKit
                </span>
            </div>

            <div className="flex flex-col gap-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-gray-400 hover:bg-hover-bg hover:text-white hover:translate-x-1'
                                }`}
                            onClick={() => setActiveView(item.id)}
                        >
                            <Icon />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-auto">
                <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-400 hover:bg-hover-bg hover:text-white transition-all w-full">
                    <UserIcon />
                    <span>Jane Doe</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
