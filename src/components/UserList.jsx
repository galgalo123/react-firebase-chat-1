import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUsers } from '../services/chatService.js';
import UserSearch from './UserSearch.jsx';

export default function UserList({ selectedUid, onSelect }) {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchUsers()
      .then((list) => {
        if (!cancelled) setUsers(list);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError('Could not load the user list.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((u) => u.uid !== currentUser.uid)
      .filter(
        (u) =>
          !term ||
          u.displayName?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
  }, [users, search, currentUser.uid]);

  return (
    <>
      <div className="sidebar-header">
        <h2>Students</h2>
        <UserSearch value={search} onChange={setSearch} />
      </div>

      {loading && <p className="status">Loading users…</p>}
      {error && <p className="error-banner">{error}</p>}

      {!loading && !error && visibleUsers.length === 0 && (
        <p className="status muted">
          {search ? 'No users match your search.' : 'No other users have registered yet.'}
        </p>
      )}

      <ul className="user-list">
        {visibleUsers.map((u) => (
          <li key={u.uid}>
            <button
              className={`user-item ${selectedUid === u.uid ? 'active' : ''}`}
              onClick={() => onSelect(u)}
            >
              <span className="avatar">
                {(u.displayName || u.email || '?')[0].toUpperCase()}
              </span>
              <span className="user-meta">
                <strong>{u.displayName || 'Unnamed user'}</strong>
                <span className="muted small">{u.email}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}