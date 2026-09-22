import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    // Check if backend is running
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => setStatus('Backend Connected ✓'))
      .catch(err => setStatus('Backend Not Running'));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Lead Management & Email CRM</h1>
        <p>Import, Clean, Score, and Segment Leads</p>
      </header>

      <main className="App-main">
        <div className="status-box">
          <p>Status: {status}</p>
        </div>

        <section className="features">
          <h2>Features (Coming Soon)</h2>
          <ul>
            <li>✅ Lead Import with Monthly Prompts</li>
            <li>✅ Automatic Data Cleaning</li>
            <li>✅ Company Aggregation & Grouping</li>
            <li>✅ Lead Scoring (Frequency + Business Potential)</li>
            <li>✅ Industry Classification (Web Lookup)</li>
            <li>✅ Geographic Segmentation (US/Canada)</li>
            <li>✅ Email List Management</li>
            <li>✅ Export for Sales Reps</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
