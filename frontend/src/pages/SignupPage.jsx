import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import styles from '../styles/Auth.module.css';

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (signup(name, email, password)) {
      navigate('/profile');
    } else {
      setError('An account with this email already exists.');
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <p className={styles.error}>{error}</p>}
        <input type="text" placeholder="Name" required value={name}
               onChange={(e) => setName(e.target.value)} className={styles.input} />
        <input type="email" placeholder="Email" required value={email}
               onChange={(e) => setEmail(e.target.value)} className={styles.input} />
        <input type="password" placeholder="Password" required value={password}
               onChange={(e) => setPassword(e.target.value)} className={styles.input} />
        <button type="submit" className={styles.btn}>Create Account</button>
        <p className={styles.link}>Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}

export default SignupPage;