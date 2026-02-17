import { useState } from 'react';

const FilterBar = ({ onFilterChange, ticketCount }) => {
    const [filters, setFilters] = useState({
        category: '',
        priority: '',
        status: '',
        search: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = {
            ...filters,
            [name]: value,
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearAll = () => {
        const clearedFilters = {
            category: '',
            priority: '',
            status: '',
            search: '',
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="filter-bar">
            <div className="filter-header">
                <h3>Ticket Dashboard</h3>
                <span className="ticket-count">
                    Showing <strong>{ticketCount}</strong> ticket{ticketCount !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="filter-controls">
                <div className="search-box">
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="🔍 Search tickets by ID, keyword, or user..."
                        className="search-input"
                    />
                </div>

                <div className="filter-dropdowns">
                    <div className="filter-group">
                        <label>Status:</label>
                        <select name="status" value={filters.status} onChange={handleChange}>
                            <option value="">All</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Category:</label>
                        <select name="category" value={filters.category} onChange={handleChange}>
                            <option value="">Any</option>
                            <option value="billing">Billing</option>
                            <option value="technical">Technical</option>
                            <option value="account">Account</option>
                            <option value="general">General</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Priority:</label>
                        <select name="priority" value={filters.priority} onChange={handleChange}>
                            <option value="">Any</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button className="btn-clear-filters" onClick={handleClearAll}>
                            Clear all
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
