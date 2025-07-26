import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const { data } = await axios.get('/api/leaderboard');
        setLeaders(data);
      } catch (err) {
        setError('Impossible de charger le classement.');
      }
    }
    fetchLeaders();
  }, []);

  return (
    <div className="dashboard">
      <h2>Classement</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="card">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Rang</th>
              <th>Utilisateur</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((entry, index) => (
              <tr key={entry.email} style={{ backgroundColor: index % 2 === 0 ? '#FAFAFA' : '#FFF' }}>
                <td>{index + 1}</td>
                <td>{entry.email}</td>
                <td>{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;