import React, { useState } from 'react';
import axios from 'axios';

function RecycleGuide() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');
    if (!query) return;
    try {
      const { data } = await axios.get(`/api/recycle/${encodeURIComponent(query)}`);
      setResult(data.result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la recherche');
    }
  };

  return (
    <div className="recycle-container">
      <h2>Guide de recyclage</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Entrez un objet (p. ex. bouteille plastique)" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }} />
        <button type="submit" style={{ marginTop: '1rem' }}>Rechercher</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div className="recycle-result">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default RecycleGuide;