import { useAuth } from '../context/AuthContext.jsx';
import { logoutUser } from '../services/authService.js';

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <header className="navbar">
      <h1>Campus Chat</h1>
      <div className="nav-right">
        <span className="nav-user">{currentUser.displayName || currentUser.email}</span>
        <button className="btn btn-ghost" onClick={logoutUser}>
          Sign out
        </button>
      </div>
    </header>
  );
}