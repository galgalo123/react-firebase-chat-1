import { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Chat from './pages/Chat.jsx';

export default function App() {
  const { currentUser, authLoading } = useAuth();
  const [mode, setMode] = useState('login');

  if (authLoading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
        <p>Checking your session…</p>
      </div>
    );
  }

  if (!currentUser) {
    return mode === 'login' ? (
      <Login onSwitch={() => setMode('register')} />
    ) : (
      <Register onSwitch={() => setMode('login')} />
    );
  }

  return (
    <div className="app">
      <Navbar />
      <Chat />
    </div>
  );
}