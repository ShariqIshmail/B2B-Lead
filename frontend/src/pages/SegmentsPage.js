import React, { useState, useEffect } from 'react';

function SegmentsPage() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    country: '',
    industry: '',
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/segments');
      const data = await res.json();
      setSegments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSegment = async (e) => {
    e.preventDefault();
    if (!newSegment.name) {
      alert('Segment name required');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSegment),
      });

      if (!res.ok) throw new Error('Failed to create segment');

      setNewSegment({ name: '', description: '', country: '', industry: '' });
      setShowForm(false);
      fetchSegments();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleExport = async (segmentId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/segments/${segmentId}/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segment-${segmentId}.csv`;
      a.click();
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>📧 Email Segments</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📧 Email Segments</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <button className="btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? '✕ Cancel' : '+ Create Segment'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateSegment} style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div className="form-group">
            <label>Segment Name *</label>
            <input
              type="text"
              placeholder="e.g., Healthcare - US - High Score"
              value={newSegment.name}
              onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Description for this segment"
              rows="3"
              value={newSegment.description}
              onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Country</label>
              <select value={newSegment.country} onChange={(e) => setNewSegment({ ...newSegment, country: e.target.value })}>
                <option value="">All</option>
                <option value="US">US</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                placeholder="e.g., Healthcare"
                value={newSegment.industry}
                onChange={(e) => setNewSegment({ ...newSegment, industry: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn">Create Segment</button>
        </form>
      )}

      {segments.length === 0 ? (
        <p style={{ marginTop: '20px' }}>No segments created yet. Create one to organize leads for email campaigns.</p>
      ) : (
        <>
          <p style={{ marginTop: '20px' }}>Total segments: <strong>{segments.length}</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {segments.map((segment) => (
              <div key={segment.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                <h3 style={{ marginTop: 0, color: '#667eea' }}>{segment.name}</h3>
                {segment.description && <p>{segment.description}</p>}
                <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                  {segment.country && <p>Country: <strong>{segment.country}</strong></p>}
                  {segment.industry && <p>Industry: <strong>{segment.industry}</strong></p>}
                  <p>Leads: <strong>{segment.lead_count || 0}</strong></p>
                </div>
                <button className="btn btn-small" onClick={() => handleExport(segment.id)}>📥 Export CSV</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SegmentsPage;
