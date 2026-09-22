import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterSource, setFilterSource] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterCountry, filterSource]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/leads/stats/overview');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Build query
      let query = 'http://localhost:5000/api/leads?';
      if (filterCountry) query += `country=${filterCountry}&`;
      if (filterSource) query += `source=${filterSource}&`;

      // Fetch leads
      const leadsRes = await fetch(query);
      const leadsData = await leadsRes.json();
      setLeads(leadsData.slice(0, 50)); // Show top 50
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>📊 Dashboard</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner"></span>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>📊 Dashboard</h2>
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
        <button className="btn" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2>📊 Dashboard Overview</h2>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Leads</div>
              <div className="stat-value">{stats.total_leads}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{stats.avg_score}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Countries</div>
              <div className="stat-value">{Object.keys(stats.by_country).length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Industries</div>
              <div className="stat-value">{Object.keys(stats.by_industry).length}</div>
            </div>
          </div>
        )}

        <h3>By Country</h3>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {Object.entries(stats.by_country).map(([country, count]) => (
              <div key={country} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{country}</div>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#667eea' }}>{count}</div>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ marginTop: '30px' }}>By Industry</h3>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {Object.entries(stats.by_industry).map(([industry, count]) => (
              <div key={industry} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{industry}</div>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#667eea' }}>{count}</div>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ marginTop: '30px' }}>By Source</h3>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {Object.entries(stats.by_source).map(([source, count]) => (
              <div key={source} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{source || 'Not specified'}</div>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#667eea' }}>{count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>🎯 Top Leads</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Filter by Country</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              <option value="US">US</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
          <div className="form-group">
            <label>Filter by Source</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="">All Sources</option>
              {stats && Object.keys(stats.by_source).map(source => (
                <option key={source} value={source}>{source || 'Not specified'}</option>
              ))}
            </select>
          </div>
        </div>

        {leads.length === 0 ? (
          <p>No leads found. <a href="#upload">Upload a file to get started.</a></p>
        ) : (
          <>
            <p>Showing {leads.length} leads (sorted by score)</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Country</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.first_name} {lead.last_name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.company_name}</td>
                      <td>{lead.industry || 'Unclassified'}</td>
                      <td>{lead.country || 'N/A'}</td>
                      <td style={{ fontWeight: 'bold', color: '#667eea' }}>
                        {lead.total_score ? lead.total_score.toFixed(1) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
