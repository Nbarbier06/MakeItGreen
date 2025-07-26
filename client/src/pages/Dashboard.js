import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard({ user }) {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    async function fetchMissions() {
      try {
        const { data } = await axios.get('/api/missions');
        setMissions(data);
      } catch (error) {
        // ignore errors on dashboard
      }
    }
    fetchMissions();
  }, []);

  const pending = missions.filter(m => !user.completedMissions?.includes(m.id));
  const nextMission = pending[0];

  return (
    <div className="dashboard">
      <h1>Bienvenue, {user.email}</h1>
      <div className="card">
        <h2>Votre score écologique</h2>
        <p>Points accumulés : <strong>{user.points}</strong></p>
      </div>
      {nextMission && (
        <div className="card">
          <h2>Mission du jour</h2>
          <h3>{nextMission.title}</h3>
          <p>{nextMission.description}</p>
          <p>Récompense : {nextMission.points} points</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;