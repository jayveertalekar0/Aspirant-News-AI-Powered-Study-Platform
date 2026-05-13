import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import styles from '../styles/Auth.module.css';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/profile');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <input type="email" placeholder="Email" required value={email}
               onChange={(e) => setEmail(e.target.value)} className={styles.input} />
        <input type="password" placeholder="Password" required value={password}
               onChange={(e) => setPassword(e.target.value)} className={styles.input} />
        <button type="submit" className={styles.btn}>Log In</button>
        <p className={styles.link}>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}

export default LoginPage;