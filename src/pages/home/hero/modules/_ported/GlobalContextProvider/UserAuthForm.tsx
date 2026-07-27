// LoginForm.tsx
import React, { useState } from 'react';
import { useUserAuthState, useUserAuthDispatch } from './UserAuthContext';

const LoginForm: React.FC = () => {
  const dispatch = useUserAuthDispatch();
  const { isAuthenticated, user } = useUserAuthState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, we're using a dummy token and user.
    // Replace this with your actual authentication logic.
    dispatch({
      type: 'LOGIN',
      payload: {
        token: 'demo-token',
        user: { id: '1', name: 'Demo User', email },
      },
    });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  if (isAuthenticated && user) {
    return (
      <div>
        <p>Welcome, {user.name}!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
