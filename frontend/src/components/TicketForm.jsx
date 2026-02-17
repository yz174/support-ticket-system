import React, { useState, useEffect } from 'react';
import { createTicket, classifyTicket } from '../services/api';
import { AiIcon, SparklesIcon } from './Icons';

const TicketForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
    });
    const [isClassifying, setIsClassifying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.description.length > 10) {
                setIsClassifying(true);
                try {
                    const result = await classifyTicket(formData.description);
                    setAiSuggestions(result);
                    setFormData(prev => ({
                        ...prev,
                        category: result.category || prev.category,
                        priority: result.priority || prev.priority
                    }));
                } catch (error) {
                    console.error("AI Classification failed", error);
                } finally {
                    setIsClassifying(false);
                }
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [formData.description]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTicket(formData);
            // Clear form on success
            setFormData({
                title: '',
                description: '',
                category: 'general',
                priority: 'medium'
            });
            setAiSuggestions(null);
            onSuccess();
        } catch (error) {
            console.error("Failed to create ticket", error);
            alert('Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* Main Form */}
            <div className="bg-card-bg border border-border-subtle rounded-xl p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block font-semibold mb-2.5 text-gray-300 text-sm">Ticket Title</label>
                        <input
                            type="text"
                            className="w-full bg-input-bg border border-border-subtle text-white px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            maxLength={200}
                            placeholder="e.g., Cannot access VPN"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2.5 text-gray-300 text-sm">Description</label>
                        <textarea
                            className="w-full bg-input-bg border border-border-subtle text-white px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                            rows={9}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            placeholder="Please describe the issue in detail..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-2.5 text-gray-300 text-sm">Category</label>
                            <select
                                className="w-full bg-input-bg border border-border-subtle text-white px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="general">General</option>
                                <option value="technical">Technical</option>
                                <option value="billing">Billing</option>
                                <option value="account">Account</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold mb-2.5 text-gray-300 text-sm">Priority</label>
                            <select
                                className="w-full bg-input-bg border border-border-subtle text-white px-4 py-3.5 rounded-lg transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border-subtle">
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>

            {/* AI Analysis Panel */}
            <div className="bg-gradient-to-b from-primary/10 to-transparent border border-primary/30 rounded-xl p-6 h-fit shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-primary/15 rounded-lg">
                        <SparklesIcon className="text-primary" size={22} />
                    </div>
                    <h3 className="text-base font-bold">AI Analysis</h3>
                </div>

                {isClassifying ? (
                    <div className="text-center py-8 text-gray-400">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm">Analyzing request...</p>
                    </div>
                ) : aiSuggestions ? (
                    <div className="animate-fadeIn space-y-5">
                        <div>
                            <div className="text-xs text-gray-400 mb-1.5">SUGGESTED CATEGORY</div>
                            <span className="inline-block px-3 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold uppercase tracking-wide">
                                {aiSuggestions.category || formData.category}
                            </span>
                        </div>

                        <div>
                            <div className="text-xs text-gray-400 mb-1.5">SUGGESTED PRIORITY</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${aiSuggestions.priority === 'critical' || aiSuggestions.priority === 'high'
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                    : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                {aiSuggestions.priority || formData.priority}
                            </span>
                        </div>

                        <div className="p-4 bg-white/5 rounded-lg border border-border-subtle">
                            <div className="flex gap-2 mb-2 text-white text-sm font-semibold">
                                <span>📚</span> Related Articles
                            </div>
                            <ul className="space-y-1.5 text-sm text-gray-400">
                                <li className="cursor-pointer hover:text-primary transition-colors underline">
                                    Troubleshooting {formData.category} issues
                                </li>
                                <li className="cursor-pointer hover:text-primary transition-colors underline">
                                    Common {formData.priority} fixes
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Start typing your description to see AI-powered suggestions and relevant articles automatically.
                    </p>
                )}
            </div>
        </div>
        </div>
    );
};

export default TicketForm;
