import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import StatsBoard from './components/StatsBoard';
import './App.css';

function App() {
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
          <div className="animate-fadeIn w-full">
            <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Create New Ticket</h1>
              <p className="text-gray-400">Describe your issue and let our AI assist you</p>
            </header>
            <TicketForm onSuccess={handleTicketCreated} />
          </div>
        );
      case 'dashboard':
        return (
          <div className="animate-fadeIn w-full">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-1">Analytics Dashboard</h1>
                <p className="text-gray-400">Overview of support performance and metrics</p>
              </div>
              <button
                onClick={() => setActiveView('create')}
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                + New Ticket
              </button>
            </header>
            <StatsBoard key={refreshTrigger} />
          </div>
        );
      case 'tickets':
        return (
          <div className="animate-fadeIn w-full">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-1">All Tickets</h1>
                <p className="text-gray-400">Manage and track support requests</p>
              </div>
              <button
                onClick={() => setActiveView('create')}
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                + New Ticket
              </button>
            </header>
            <TicketList key={refreshTrigger} />
          </div>
        );
      case 'ai-triage':
      case 'settings':
        return (
          <div className="animate-fadeIn flex flex-col items-center justify-center h-[60vh] text-gray-400 w-full">
            <div className="max-w-md text-center">
              <div className="text-6xl mb-6">🚧</div>
              <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
              <p className="text-gray-400">This module is under development.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-7xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
