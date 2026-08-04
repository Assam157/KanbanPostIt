import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(name, email, password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{ fontFamily: 'Caveat, cursive', fontSize: '36px', color: '#4a2c17', marginBottom: '16px' }}>
          Create Your Account
        </h2>
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <input style={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" style={styles.btn}>Register</button>
        <p style={{ marginTop: '12px', fontSize: '16px' }}>
          Already have an account? <Link to="/login" style={{ color: '#6b4226', fontWeight: 'bold' }}>Login</Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  form: {
    background: '#fff9e0',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '3px 4px 8px rgba(0,0,0,0.15)',
    border: '1px solid #d4a373',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    borderRadius: '4px',
    border: '1px solid #d4a373',
    fontFamily: 'Indie Flower, cursive',
    fontSize: '16px',
  },
  btn: {
    width: '100%',
    padding: '12px',
    marginTop: '8px',
    background: '#f4d03f',
    color: '#4a2c17',
    border: 'none',
    borderRadius: '4px',
    fontFamily: 'Caveat, cursive',
    fontSize: '22px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Register;