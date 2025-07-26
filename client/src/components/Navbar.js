import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div>
        <Link to="/">Eco App</Link>
      </div>
      <div>
        <Link to="/scan">Scanner</Link>
        <Link to="/missions">Missions</Link>
        <Link to="/recycle">Recyclage</Link>
        <Link to="/leaderboard">Classement</Link>
        <button onClick={onLogout}>Déconnexion</button>
      </div>
    </nav>
  );
}

export default Navbar;