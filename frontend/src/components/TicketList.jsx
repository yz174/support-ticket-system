import React, { useEffect, useState } from 'react';
import { getTickets } from '../services/api';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [search, setSearch] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await getTickets({
                status: filterStatus,
                priority: filterPriority,
                search: search
            });
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filterStatus, filterPriority]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTickets();
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'critical':
            case 'high':
                return 'bg-red-500/15 text-red-400 border-red-500/20';
            case 'medium':
                return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20';
            case 'low':
                return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
            default:
                return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'open':
                return 'bg-green-500/15 text-green-400 border-green-500/20';
            case 'in_progress':
                return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20';
            case 'resolved':
                return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
            case 'closed':
                return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
            default:
                return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-6 w-full max-w-6xl mx-auto">
            {/* Filters Card */}
            <div className="bg-card-bg border border-border-subtle rounded-xl p-4 shadow-xl">
                <div className="flex flex-wrap gap-4 items-center">
                    <form onSubmit={handleSearch} className="flex-1 min-w-[250px]">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                className="w-full bg-input-bg border border-border-subtle text-white pl-10 pr-4 py-2.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </form>

                    <div className="flex gap-2">
                        <select
                            className="bg-input-bg border border-border-subtle text-white px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Status: All</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select
                            className="bg-input-bg border border-border-subtle text-white px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                        >
                            <option value="">Priority: All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tickets Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-border-subtle border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-card-bg border border-border-subtle rounded-xl p-16 text-center shadow-xl">
                    <div className="text-5xl mb-4 opacity-50">📭</div>
                    <h3 className="text-xl font-bold mb-2">No tickets found</h3>
                    <p className="text-gray-400">Try adjusting your filters or create a new ticket.</p>
                </div>
            ) : (
                <div className="bg-card-bg border border-border-subtle rounded-xl overflow-hidden shadow-xl">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-border-subtle">
                            <tr>
                                <th className="px-4 py-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">Ticket</th>
                                <th className="px-4 py-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">Category</th>
                                <th className="px-4 py-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-4 py-4 text-left text-gray-400 text-xs font-semibold uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-4 text-right text-gray-400 text-xs font-semibold uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id} className="border-b border-border-subtle hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="font-semibold mb-0.5">{ticket.title}</div>
                                        <div className="text-sm text-gray-400 max-w-md truncate">
                                            {ticket.description}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-gray-400 capitalize">
                                            {ticket.category?.replace('_', ' ') || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-block px-2.5 py-1 border rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(ticket.status)}`}>
                                            {ticket.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-block px-2.5 py-1 border rounded-full text-xs font-semibold uppercase tracking-wide ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right text-sm text-gray-400">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-3 border-t border-border-subtle text-center text-gray-400 text-sm">
                        Showing {tickets.length} results
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketList;
