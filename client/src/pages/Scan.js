import React, { useState } from 'react';
import axios from 'axios';

function Scan({ user }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result;
        // OCR call
        const ocrResp = await axios.post('/api/ocr', { image: base64data });
        const lines = ocrResp.data.lines;
        // Send lines to product scoring
        const prodResp = await axios.post('/api/products/score', { items: lines });
        setResults(prodResp.data);
        setLoading(false);
      };
    } catch (err) {
      setError(err?.response?.data?.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="scan-container">
      <h2>Scanner un ticket de caisse</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" style={{ marginTop: '1rem' }} disabled={loading}>Analyser</button>
      </form>
      {loading && <p>Analyse en cours…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="scan-results">
        {results.map((item, idx) => (
          <div key={idx} className="card product-item">
            <div className="card-title">{item.name}</div>
            <span className={`score-label ${item.score.grade}`}>{item.score.label}</span>
            {item.diy && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>DIY :</strong> {item.diy.title}<br />
                <small>{item.diy.instructions}</small>
              </div>
            )}
            {item.alternatives && item.alternatives.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Alternatives :</strong>
                <ul>
                  {item.alternatives.map((alt, i) => (
                    <li key={i}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Scan;