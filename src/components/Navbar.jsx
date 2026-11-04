import { useAuth } from '../context/AuthContext.jsx';
import { logoutUser } from '../services/authService.js';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { currentUser } = useAuth();
  const name = currentUser.displayName || currentUser.email || 'You';

  return (
    <header className="navbar">
      <div className="brand">
        <Logo />
        <h1>Chit Chat</h1>
      </div>

      <div className="nav-right">
        <div className="nav-user">
          <span className="avatar avatar-sm">{name[0].toUpperCase()}</span>
          <span className="nav-name">{name}</span>
        </div>
        <button className="btn btn-ghost" onClick={logoutUser}>
          Sign out
        </button>
      </div>
    </header>
  );
}