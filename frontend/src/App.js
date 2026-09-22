import React, { useState, useEffect } from 'react';
import './App.css';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/Dashboard';
import CompaniesPage from './pages/CompaniesPage';
import SegmentsPage from './pages/SegmentsPage';

function App() {
  const [status, setStatus] = useState('Loading...');
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check if backend is running
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => setStatus('Backend Connected ✓'))
      .catch(err => setStatus('Backend Not Running'));
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'upload':
        return <UploadPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'segments':
        return <SegmentsPage />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Lead Management & Email CRM</h1>
        <p>Import, Clean, Score, and Segment Leads</p>
        <div className="status-badge">
          <span>{status}</span>
        </div>
      </header>

      <nav className="App-nav">
        <button
          className={currentPage === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentPage('dashboard')}
        >
          📈 Dashboard
        </button>
        <button
          className={currentPage === 'upload' ? 'active' : ''}
          onClick={() => setCurrentPage('upload')}
        >
          📤 Upload
        </button>
        <button
          className={currentPage === 'companies' ? 'active' : ''}
          onClick={() => setCurrentPage('companies')}
        >
          🏢 Companies
        </button>
        <button
          className={currentPage === 'segments' ? 'active' : ''}
          onClick={() => setCurrentPage('segments')}
        >
          📧 Segments
        </button>
      </nav>

      <main className="App-main">
        {renderPage()}
      </main>

      <footer className="App-footer">
        <p>Lead CRM v0.1.0 • Powered by Node.js + React + PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
