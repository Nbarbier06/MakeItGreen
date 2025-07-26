import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import Missions from './pages/Missions';
import RecycleGuide from './pages/RecycleGuide';
import Leaderboard from './pages/Leaderboard';

// Simple authentication wrapper using localStorage
function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('eco-user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem('eco-user', JSON.stringify(userObj));
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eco-user');
    navigate('/login');
  };

  return (
    <div className="App">
      {user && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
        <Route path="/scan" element={user ? <Scan user={user} /> : <Login onLogin={handleLogin} />} />
        <Route path="/missions" element={user ? <Missions user={user} setUser={setUser} /> : <Login onLogin={handleLogin} />} />
        <Route path="/recycle" element={user ? <RecycleGuide /> : <Login onLogin={handleLogin} />} />
        <Route path="/leaderboard" element={user ? <Leaderboard /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={user ? <Dashboard user={user} /> : <Login onLogin={handleLogin} />} />
        {/* Fallback to login */}
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </div>
  );
}

export default App;