import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await axios.post('/api/auth/register', { email, password });
      // Auto login after registration
      const { data } = await axios.post('/api/auth/login', { email, password });
      onRegister({ email: email, points: data.user.points, completedMissions: data.user.completedMissions });
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur d’inscription');
    }
  };

  return (
    <div className="form-container">
      <h2>Créer un compte</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <div className="form-group">
          <button type="submit">S’inscrire</button>
        </div>
      </form>
      <p style={{ textAlign: 'center' }}>
        Déjà inscrit ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}

export default Register;