import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Missions({ user, setUser }) {
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMissions() {
      try {
        const { data } = await axios.get('/api/missions');
        setMissions(data);
      } catch (err) {
        setError('Impossible de récupérer les missions');
      }
    }
    fetchMissions();
  }, []);

  const handleComplete = async (missionId) => {
    try {
      const { data } = await axios.post('/api/missions/complete', { email: user.email, missionId });
      // update user points and completed missions locally
      setUser({ ...user, points: data.points, completedMissions: [...user.completedMissions, missionId] });
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  return (
    <div className="dashboard">
      <h2>Missions écologiques</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul className="mission-list">
        {missions.map((mission) => {
          const completed = user.completedMissions.includes(mission.id);
          return (
            <li key={mission.id} className="mission-item">
              <div>
                <strong>{mission.title}</strong>
                <p style={{ margin: 0 }}>{mission.description}</p>
                <small>{mission.points} points</small>
              </div>
              <button onClick={() => handleComplete(mission.id)} disabled={completed}>
                {completed ? 'Validée' : 'Valider'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Missions;