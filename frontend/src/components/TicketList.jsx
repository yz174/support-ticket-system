import React, { useEffect, useState, useCallback } from 'react';
import { getTickets, updateTicket } from '../services/api';
import { AlertTriangle, BarChart2, ClipboardList, Laptop, CreditCard, User, FileText, Sparkles } from 'lucide-react';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 14;

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTickets({
                status: filterStatus,
                priority: filterPriority,
                category: filterCategory,
                search: search
            });
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterPriority, filterCategory, search]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filters change
        fetchTickets();
    }, [fetchTickets]);

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return past.toLocaleDateString();
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

    const getPriorityIcon = (p) => {
        switch (p) {
            case 'critical':
            case 'high':
                return <AlertTriangle className="w-3.5 h-3.5" />;
            case 'medium':
                return <BarChart2 className="w-3.5 h-3.5" />;
            case 'low':
                return <ClipboardList className="w-3.5 h-3.5" />;
            default:
                return <ClipboardList className="w-3.5 h-3.5" />;
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'open':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'in_progress':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'resolved':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'closed':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default:
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    const getStatusText = (s) => {
        const statusMap = {
            'open': 'Open',
            'in_progress': 'In Progress',
            'resolved': 'Resolved',
            'closed': 'Closed'
        };
        return statusMap[s] || s;
    };

    const getCategoryIcon = (c) => {
        const icons = {
            'technical': <Laptop className="w-3.5 h-3.5" />,
            'billing': <CreditCard className="w-3.5 h-3.5" />,
            'account': <User className="w-3.5 h-3.5" />,
            'general': <FileText className="w-3.5 h-3.5" />
        };
        return icons[c] || <FileText className="w-3.5 h-3.5" />;
    };

    const handleStatusClick = async (ticketId, currentStatus) => {
        const statuses = ['open', 'in_progress', 'resolved', 'closed'];
        const currentIndex = statuses.indexOf(currentStatus);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        
        try {
            await updateTicket(ticketId, { status: nextStatus });
            fetchTickets();
        } catch (error) {
            console.error('Failed to update ticket status', error);
            alert('Failed to update ticket status');
        }
    };

    const clearAllFilters = () => {
        setFilterStatus('');
        setFilterPriority('');
        setFilterCategory('');
        setSearch('');
        setCurrentPage(1);
    };

    // Pagination calculations
    const totalPages = Math.ceil(tickets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTickets = tickets.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show smart pagination with ellipsis
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        
        return pages;
    };

    const removeFilter = (filterType) => {
        switch(filterType) {
            case 'status':
                setFilterStatus('');
                break;
            case 'priority':
                setFilterPriority('');
                break;
            case 'category':
                setFilterCategory('');
                break;
        }
    };

    const activeFilters = [
        filterStatus && { type: 'status', label: `Status: ${getStatusText(filterStatus)}`, value: filterStatus },
        filterPriority && { type: 'priority', label: `Priority: ${filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}`, value: filterPriority },
        filterCategory && { type: 'category', label: `Category: ${filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}`, value: filterCategory }
    ].filter(Boolean);

    return (
        <div className="space-y-4 w-full max-w-7xl mx-auto">
            {/* Filter Pills and Sort */}
            <div className="flex flex-wrap items-center gap-3 px-1">
                <span className="text-sm text-gray-400 font-medium">Filters:</span>
                
                {/* Status Filter */}
                <select
                    className="bg-input-bg border border-border-subtle text-white text-sm px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">Status: All</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>

                {/* Category Filter */}
                <select
                    className="bg-input-bg border border-border-subtle text-white text-sm px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="">Category: Any</option>
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                </select>

                {/* Priority Filter */}
                <select
                    className="bg-input-bg border border-border-subtle text-white text-sm px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                >
                    <option value="">Priority: Any</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>

                {/* Active Filter Pills */}
                {activeFilters.map((filter, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-lg text-sm text-white"
                    >
                        <span>{filter.label}</span>
                        <button
                            onClick={() => removeFilter(filter.type)}
                            className="hover:text-primary transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {/* Clear All */}
                {activeFilters.length > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-gray-400 hover:text-white transition-colors underline"
                    >
                        Clear all
                    </button>
                )}

                {/* Sort Dropdown */}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-400">Sort by:</span>
                    <select
                        className="bg-input-bg border border-border-subtle text-white text-sm px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">Priority</option>
                    </select>
                </div>
            </div>

            {/* Tickets List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-border-subtle border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-card-bg border border-border-subtle rounded-xl p-16 text-center shadow-xl">
                    <div className="text-5xl mb-4 opacity-50">📭</div>
                    <h3 className="text-xl font-bold mb-2">No tickets found</h3>
                    <p className="text-gray-400">Try adjusting your filters or create a new ticket.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {currentTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            className="bg-card-bg border border-border-subtle rounded-xl p-5 shadow-lg hover:border-primary/30 transition-all group"
                        >
                            <div className="flex gap-4">
                                {/* Left Side - Status & Time */}
                                <div className="flex flex-col items-start gap-2 w-32 flex-shrink-0">
                                    <button
                                        onClick={() => handleStatusClick(ticket.id, ticket.status)}
                                        className={`px-3 py-1 border rounded-lg text-xs font-bold uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(ticket.status)}`}
                                        title="Click to change status"
                                    >
                                        {getStatusText(ticket.status)}
                                    </button>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                                        </svg>
                                        {getTimeAgo(ticket.created_at)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Title and ID */}
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                            {ticket.title}
                                        </h3>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-xs text-gray-500 font-mono">
                                                #T-{ticket.id}
                                            </span>
                                            <button className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <circle cx="12" cy="5" r="2"/>
                                                    <circle cx="12" cy="12" r="2"/>
                                                    <circle cx="12" cy="19" r="2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                        {ticket.description}
                                    </p>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {/* AI Badge */}
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/15 text-purple-400 border border-purple-500/20 rounded-md text-xs font-semibold">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>AI CAT</span>
                                        </span>

                                        {/* Category */}
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-gray-300 border border-border-subtle rounded-md text-xs font-medium capitalize">
                                            {getCategoryIcon(ticket.category)}
                                            <span>{ticket.category?.replace('_', ' ')}</span>
                                        </span>

                                        {/* Priority */}
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-semibold capitalize ${getPriorityColor(ticket.priority)}`}>
                                            {getPriorityIcon(ticket.priority)}
                                            <span>{ticket.priority} Priority</span>
                                        </span>

                                        {/* Assignee */}
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-gray-400 border border-border-subtle rounded-md text-xs">
                                            <User className="w-3.5 h-3.5" />
                                            <span>Unassigned</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && tickets.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <button 
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ‹
                    </button>
                    
                    {renderPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                                    currentPage === page
                                        ? 'bg-primary text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                    
                    <button 
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ›
                    </button>
                </div>
            )}

            {/* Results count */}
            {!loading && tickets.length > 0 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                    Showing {startIndex + 1} to {Math.min(endIndex, tickets.length)} of {tickets.length} results
                </div>
            )}
        </div>
    );
};

export default TicketList;
