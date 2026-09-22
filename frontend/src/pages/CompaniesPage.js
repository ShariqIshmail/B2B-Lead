import React, { useState, useEffect } from 'react';

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/companies');
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>🏢 Companies</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner"></span>
          <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🏢 Company Management</h2>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {companies.length === 0 ? (
        <p>No companies found. Upload leads to see companies.</p>
      ) : (
        <>
          <p>Total companies: <strong>{companies.length}</strong></p>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Domain</th>
                  <th>Industry</th>
                  <th>Contacts</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedCompany(company)}>
                    <td><strong>{company.name}</strong></td>
                    <td>{company.domain || 'N/A'}</td>
                    <td>{company.industry || 'Unclassified'}</td>
                    <td style={{ color: '#667eea', fontWeight: 'bold' }}>{company.lead_count || 0}</td>
                    <td>{company.country || 'US'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedCompany && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>{selectedCompany.name}</h3>
          <p><strong>Domain:</strong> {selectedCompany.domain || 'N/A'}</p>
          <p><strong>Industry:</strong> {selectedCompany.industry || 'Unclassified'}</p>
          <p><strong>Confidence:</strong> {selectedCompany.industry_confidence ? (selectedCompany.industry_confidence * 100).toFixed(0) + '%' : 'N/A'}</p>
          <p><strong>Contacts:</strong> {selectedCompany.lead_count || 0}</p>
          <p><strong>Country:</strong> {selectedCompany.country || 'US'}</p>
          <button className="btn btn-secondary" onClick={() => setSelectedCompany(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default CompaniesPage;
