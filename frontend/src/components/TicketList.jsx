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
    }, [filterStatus, filterPriority]); // Re-fetch when filters change

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTickets();
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'critical': return 'badge-red';
            case 'high': return 'badge-red';
            case 'medium': return 'badge-yellow';
            case 'low': return 'badge-blue';
            default: return 'badge-blue';
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'open': return 'badge-green';
            case 'in_progress': return 'badge-yellow';
            case 'resolved': return 'badge-blue';
            case 'closed': return 'badge-purple';
            default: return 'badge-blue';
        }
    };

    return (
        <div className="ticket-dashboard">
            <div className="card mb-6" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                className="premium-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <svg
                                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-muted)' }}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </form>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            className="premium-input"
                            style={{ width: 'auto' }}
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
                            className="premium-input"
                            style={{ width: 'auto' }}
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

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div style={{ width: '30px', height: '30px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : tickets.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No tickets found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or create a new ticket.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>TICKET</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>CATEGORY</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>STATUS</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>PRIORITY</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.2s' }} className="hover:bg-white/5">
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>{ticket.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {ticket.description}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)' }}>{ticket.category?.replace('_', ' ') || '-'}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${getStatusColor(ticket.status)}`}>
                                            {ticket.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Showing {tickets.length} results
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketList;
