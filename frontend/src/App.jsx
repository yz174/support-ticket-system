import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import StatsBoard from './components/StatsBoard';
import './App.css';

function App() {
  // 'dashboard', 'tickets', 'create', 'ai-triage', 'settings'
  const [activeView, setActiveView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTicketCreated = () => {
    setActiveView('tickets');
    setRefreshTrigger(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'create':
        return (
          <div className="fade-in">
            <header className="page-header">
              <div className="page-title">
                <h1>Create New Ticket</h1>
                <p className="page-subtitle">Describe your issue and let our AI assist you</p>
              </div>
            </header>
            <TicketForm onSuccess={handleTicketCreated} />
          </div>
        );
      case 'dashboard':
        return (
          <div className="fade-in">
            <header className="page-header">
              <div className="page-title">
                <h1>Analytics Dashboard</h1>
                <p className="page-subtitle">Overview of support performance and metrics</p>
              </div>
              <button className="btn-primary" onClick={() => setActiveView('create')}>
                + New Ticket
              </button>
            </header>
            <StatsBoard key={refreshTrigger} />
          </div>
        );
      case 'tickets':
        return (
          <div className="fade-in">
            <header className="page-header">
              <div className="page-title">
                <h1>All Tickets</h1>
                <p className="page-subtitle">Manage and track support requests</p>
              </div>
              <button className="btn-primary" onClick={() => setActiveView('create')}>
                + New Ticket
              </button>
            </header>
            <TicketList key={refreshTrigger} />
          </div>
        );
      case 'ai-triage':
      case 'settings':
        return (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
            <h2>Coming Soon</h2>
            <p>This module is under development.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
