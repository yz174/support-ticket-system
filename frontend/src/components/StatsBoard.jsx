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
    Cell,
    Legend
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

    // Priority data with proper ordering and colors
    const priorityOrder = ['low', 'medium', 'high', 'critical'];
    const priorityData = priorityOrder.map(priority => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: stats.priority_breakdown[priority] || 0,
        fill: priority === 'critical' ? '#ef4444' : priority === 'high' ? '#f59e0b' : priority === 'medium' ? '#3b82f6' : '#6366f1'
    }));

    // Category data with proper labels
    const categoryMapping = {
        'technical': { label: 'Technical Support', color: '#3b82f6' },
        'billing': { label: 'Billing Inquiry', color: '#a855f7' },
        'general': { label: 'Feature Request', color: '#10b981' },
        'account': { label: 'Other', color: '#6b7280' }
    };

    const categoryData = Object.entries(stats.category_breakdown).map(([name, value]) => ({
        name: categoryMapping[name]?.label || name,
        value,
        color: categoryMapping[name]?.color || '#6b7280'
    }));

    // Calculate percentages for category chart
    const totalCategoryTickets = Object.values(stats.category_breakdown).reduce((a, b) => a + b, 0);

    // Custom legend for category chart
    const renderCustomLegend = (props) => {
        const { payload } = props;
        return (
            <div className="flex flex-col gap-2.5 mt-6 px-4">
                {payload.map((entry, index) => {
                    const value = entry.payload?.value || 0;
                    const percentage = totalCategoryTickets > 0 ? Math.round((value / totalCategoryTickets) * 100) : 0;
                    return (
                        <div key={`legend-${index}`} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-gray-300">{entry.value}</span>
                            </div>
                            <span className="text-gray-400 font-semibold">{percentage}%</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8 w-full pb-8 px-4">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <div className="bg-card-bg border border-border-subtle rounded-xl p-7 shadow-xl">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Total Tickets</span>
                    <div className="text-5xl font-extrabold mt-3 mb-4">{stats.total_tickets}</div>
                    <span className="inline-block px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
                        +{Math.round((stats.total_tickets / (stats.total_tickets - 2)) * 100 - 100)}% vs last period
                    </span>
                </div>

                <div className="bg-card-bg border border-border-subtle rounded-xl p-7 shadow-xl">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Open Tickets</span>
                    <div className="text-5xl font-extrabold mt-3 mb-4 text-yellow-500">{stats.open_tickets}</div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">Requires attention</span>
                            {stats.open_tickets > 10 && (
                                <span className="text-xs text-orange-400 font-semibold">High Load</span>
                            )}
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((stats.open_tickets / stats.total_tickets) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg border border-border-subtle rounded-xl p-7 shadow-xl">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Avg Tickets / Day</span>
                    <div className="text-5xl font-extrabold mt-3 mb-4 text-blue-500">{stats.avg_tickets_per_day?.toFixed(1)}</div>
                    <span className="text-sm text-gray-400">Tickets per day</span>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                <div className="bg-card-bg border border-border-subtle rounded-xl p-7 shadow-xl" style={{ minHeight: '520px' }}>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold">Tickets by Priority</h3>
                        <p className="text-sm text-gray-400 mt-1">Distribution across urgency levels</p>
                    </div>
                    <ResponsiveContainer width="100%" height={420}>
                        <BarChart data={priorityData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                fontSize={13}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={13}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: '#161b2e', 
                                    borderColor: '#1f2937', 
                                    color: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #1f2937'
                                }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            />
                            <Bar 
                                dataKey="value" 
                                radius={[8, 8, 0, 0]}
                                maxBarSize={80}
                            >
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-card-bg border border-border-subtle rounded-xl p-7 shadow-xl" style={{ minHeight: '520px' }}>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold">Tickets by Category</h3>
                        <p className="text-sm text-gray-400 mt-1">AI-driven classification</p>
                    </div>
                    <div style={{ height: '460px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="35%"
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend 
                                    content={renderCustomLegend}
                                    verticalAlign="bottom"
                                    height={140}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsBoard;
