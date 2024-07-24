import React, { useState } from 'react';
import axios from 'axios';
import './AuthForm.css';

const AuthForm = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await axios.post('/api/v1/users/login', { email, password }, { withCredentials: true });
        alert('Login successful');
        if (onLoginSuccess) onLoginSuccess(); 
      } else {
        if (password !== passwordConfirm) {
          alert('Passwords do not match');
          return;
        }
        await axios.post('/api/v1/users/signup', { name, email, password, username, passwordConfirm });
        alert('Signup successful');
        if (onLoginSuccess) onLoginSuccess(); 
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Error during authentication');
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Name"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username" 
            />
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              placeholder="Confirm Password"
            />
          </>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
        />
        <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
        <button type="button" onClick={onClose}>Close</button>
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Signup" : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
