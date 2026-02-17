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

    if (!stats) return (
        <div className="flex justify-center items-center py-20">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-border-subtle border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading stats...</p>
            </div>
        </div>
    );

    const priorityData = Object.entries(stats.priority_breakdown).map(([name, value]) => ({ name, value }));
    const categoryData = Object.entries(stats.category_breakdown).map(([name, value]) => ({ name, value }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6 w-full">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Total Tickets</span>
                    <div className="text-4xl font-extrabold mt-2 mb-3">{stats.total_tickets}</div>
                    <span className="inline-block px-2.5 py-1 bg-green-500/15 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
                        +12% vs last week
                    </span>
                </div>

                <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Open Tickets</span>
                    <div className="text-4xl font-extrabold mt-2 mb-3 text-yellow-500">{stats.open_tickets}</div>
                    <span className="text-sm text-gray-400">Requires attention</span>
                </div>

                <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Avg Resolution</span>
                    <div className="text-4xl font-extrabold mt-2 mb-3 text-blue-500">4.2h</div>
                    <span className="text-sm text-gray-400">Ticket lifetime</span>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl" style={{ height: '350px' }}>
                    <h3 className="text-lg font-bold mb-6">Tickets by Priority</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={priorityData}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161b2e', borderColor: '#1f2937', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#135bec" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl" style={{ height: '350px' }}>
                    <h3 className="text-lg font-bold mb-6">Tickets by Category</h3>
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
                                contentStyle={{ backgroundColor: '#161b2e', borderColor: '#1f2937', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StatsBoard;
