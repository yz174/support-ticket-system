import { useState } from 'react';

const TicketCard = ({ ticket, onStatusChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        try {
            await onStatusChange(ticket.id, newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444',
            critical: '#dc2626',
        };
        return colors[priority] || '#6b7280';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            billing: '💳',
            technical: '🔧',
            account: '👤',
            general: '📋',
        };
        return icons[category] || '📋';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const truncateText = (text, maxLength = 150) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className={`ticket-card status-${ticket.status}`}>
            <div className="ticket-header">
                <div className="ticket-id">#{ticket.id}</div>
                <div className="ticket-meta">
                    <span className="ticket-category">
                        <span className="category-icon">{getCategoryIcon(ticket.category)}</span>
                        {ticket.category}
                    </span>
                    <span
                        className="ticket-priority"
                        style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                    >
                        {ticket.priority}
                    </span>
                </div>
            </div>

            <div className="ticket-content">
                <h3 className="ticket-title">{ticket.title}</h3>
                <p className="ticket-description">
                    {isExpanded ? ticket.description : truncateText(ticket.description)}
                </p>
                {ticket.description.length > 150 && (
                    <button
                        className="btn-expand"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>

            <div className="ticket-footer">
                <div className="ticket-time">{formatDate(ticket.created_at)}</div>
                <div className="ticket-status-selector">
                    <label>Status:</label>
                    <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isUpdating}
                        className={`status-select status-${ticket.status}`}
                    >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
