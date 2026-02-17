import React, { useEffect, useState } from 'react';
import { getTicketStats } from '../services/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const StatsBoard = ({ refreshTrigger }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getTicketStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, [refreshTrigger]);

    if (!stats) return <div className="text-center p-8">Loading stats...</div>;

    // Prepare data for charts
    const priorityData = Object.entries(stats.priority_breakdown).map(([name, value]) => ({ name, value }));
    const categoryData = Object.entries(stats.category_breakdown).map(([name, value]) => ({ name, value }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="stats-dashboard">
            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>TOTAL TICKETS</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.total_tickets}</span>
                    <span className="badge badge-green" style={{ width: 'fit-content' }}>+12% vs last week</span>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>OPEN TICKETS</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)' }}>{stats.open_tickets}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Requires attention</span>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>AVG RESOLUTION</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--info)' }}>4.2h</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket lifetime</span>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ height: '350px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Tickets by Priority</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={priorityData}>
                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                                itemStyle={{ color: 'var(--text-main)' }}
                            />
                            <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ height: '350px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Tickets by Category</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}
                                itemStyle={{ color: 'var(--text-main)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StatsBoard;
