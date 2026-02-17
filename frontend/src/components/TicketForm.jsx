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

    // Debounce AI classification
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.description.length > 10) {
                setIsClassifying(true);
                try {
                    const result = await classifyTicket(formData.description);
                    setAiSuggestions(result);
                    // Auto-apply suggestions if user hasn't manually changed them
                    setFormData(prev => ({
                        ...prev,
                        category: result.category,
                        priority: result.priority
                    }));
                } catch (error) {
                    console.error("AI Classification failed", error);
                } finally {
                    setIsClassifying(false);
                }
            }
        }, 1500); // Wait 1.5s after typing stops

        return () => clearTimeout(timer);
    }, [formData.description]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTicket(formData);
            onSuccess();
        } catch (error) {
            alert('Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            {/* Main Form */}
            <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label className="label-text">Ticket Title</label>
                        <input
                            type="text"
                            className="premium-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="e.g., Cannot access VPN"
                        />
                    </div>

                    <div>
                        <label className="label-text">Description</label>
                        <textarea
                            className="premium-input"
                            rows={8}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            placeholder="Please describe the issue in detail..."
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="label-text">Category</label>
                            <select
                                className="premium-input"
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
                            <label className="label-text">Priority</label>
                            <select
                                className="premium-input"
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

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>

            {/* AI Analysis Panel - Stitch Design */}
            <div className="card" style={{ height: 'fit-content', background: 'linear-gradient(180deg, rgba(19, 91, 236, 0.05) 0%, rgba(19, 91, 236, 0) 100%)', border: '1px solid rgba(19, 91, 236, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '6px', background: 'rgba(19, 91, 236, 0.1)', borderRadius: '6px' }}>
                        <SparklesIcon className="text-primary" size={20} />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Analysis</h3>
                </div>

                {isClassifying ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }}></div>
                        <p style={{ fontSize: '0.85rem' }}>Analyzing request...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : aiSuggestions ? (
                    <div className="fade-in">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>SUGGESTED CATEGORY</div>
                            <span className="badge badge-blue">
                                {aiSuggestions.category?.toUpperCase() || formData.category.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>SUGGESTED PRIORITY</div>
                            <span className={`badge ${aiSuggestions.priority === 'critical' || aiSuggestions.priority === 'high' ? 'badge-red' : 'badge-yellow'}`}>
                                {aiSuggestions.priority?.toUpperCase() || formData.priority.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                                <span>📚</span> Related Articles
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <li style={{ marginBottom: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}>Troubleshooting {formData.category} issues</li>
                                <li style={{ cursor: 'pointer', textDecoration: 'underline' }}>Common {formData.priority} fixes</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        Start typing your description to see AI-powered suggestions and relevant articles automatically.
                    </p>
                )}
            </div>
        </div>
    );
};

export default TicketForm;
