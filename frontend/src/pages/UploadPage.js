import React, { useState } from 'react';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/imports/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2>📤 Upload Lead List</h2>
      <p>Import leads from CSV file. Supports tradeshow lists and email campaigns.</p>

      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label>CSV File</label>
          <div
            className="upload-area"
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <p>📁 Click to select CSV file</p>
            <p style={{ fontSize: '0.9em', color: '#999' }}>
              {file ? file.name : 'or drag and drop'}
            </p>
          </div>
        </div>

        <button type="submit" className="btn" disabled={!file || uploading}>
          {uploading ? (
            <>
              <span className="spinner"></span> Uploading...
            </>
          ) : (
            'Upload & Process'
          )}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="alert alert-success">
          <h3>✅ Import Successful!</h3>
          <p><strong>File:</strong> {result.file_name}</p>
          <p><strong>Total Rows:</strong> {result.total_rows}</p>
          <p><strong>Processed:</strong> {result.processed}</p>
          <p><strong>Duplicates Skipped:</strong> {result.duplicates}</p>
          <p><strong>Errors:</strong> {result.errors}</p>

          {result.error_details && result.error_details.length > 0 && (
            <div>
              <h4>Error Details (first 10):</h4>
              <ul>
                {result.error_details.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: '30px', backgroundColor: '#f8f9fa' }}>
        <h3>📋 CSV Format Requirements</h3>
        <p>Your CSV file should contain the following columns (headers required):</p>
        <ul>
          <li><strong>email</strong> - Email address (required, unique)</li>
          <li><strong>name</strong> - Full name (will be parsed to first/last)</li>
          <li><strong>company</strong> - Company name (required)</li>
          <li><strong>phone</strong> - Phone number (optional)</li>
          <li><strong>title</strong> - Job title (optional)</li>
          <li><strong>country</strong> - US or Canada (optional, defaults to US)</li>
          <li><strong>source</strong> - Tradeshow, email campaign, etc. (optional)</li>
        </ul>

        <h3>Example CSV:</h3>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`email,name,company,phone,title,country,source
john.smith@example.com,John Smith,Example Corp,555-1234,Sales Manager,US,tradeshow
jane.doe@acme.com,Jane Doe,ACME Inc,555-5678,Marketing Director,US,email campaign
bob.wilson@healthco.com,Bob Wilson,Healthcare Solutions,555-9999,CTO,Canada,tradeshow`}
        </pre>
      </div>
    </div>
  );
}

export default UploadPage;
