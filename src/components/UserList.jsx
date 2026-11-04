import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useUsers } from '../hooks/useUsers.js';
import { useConversations } from '../hooks/useConversations.js';
import UserSearch from './UserSearch.jsx';

const initial = (u) => (u.displayName || u.email || '?')[0].toUpperCase();

function matches(user, term) {
  if (!term) return true;
  return (
    user.displayName?.toLowerCase().includes(term) ||
    user.email?.toLowerCase().includes(term)
  );
}

function PersonRow({ user, subtitle, active, onClick }) {
  return (
    <button className={`user-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="avatar">{initial(user)}</span>
      <span className="user-meta">
        <strong>{user.displayName || 'Unnamed user'}</strong>
        <span className="preview">{subtitle}</span>
      </span>
    </button>
  );
}

export default function UserList({ selectedUid, onSelect }) {
  const { currentUser } = useAuth();
  const { users, loading, error } = useUsers();
  const conversations = useConversations(currentUser.uid);
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();

  const others = useMemo(
    () => users.filter((u) => u.uid !== currentUser.uid),
    [users, currentUser.uid]
  );

  // Conversations that have at least one message, paired with the other person's profile.
  const recent = useMemo(() => {
    const byUid = new Map(others.map((u) => [u.uid, u]));
    return conversations
      .filter((c) => c.lastMessage)
      .map((c) => ({
        conversation: c,
        user: byUid.get(c.participants.find((p) => p !== currentUser.uid)),
      }))
      .filter((r) => r.user);
  }, [conversations, others, currentUser.uid]);

  const showRecent = !term && recent.length > 0;
  const recentUids = new Set(recent.map((r) => r.user.uid));

  const people = term
    ? others.filter((u) => matches(u, term))
    : others.filter((u) => !recentUids.has(u.uid));

  const nothingToShow = !showRecent && people.length === 0;

  return (
    <>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h2>Chats</h2>
          <span className="count">{others.length}</span>
        </div>
        <UserSearch value={search} onChange={setSearch} />
      </div>

      {loading && <p className="status">Loading people…</p>}
      {error && <p className="error-banner">{error}</p>}

      {!loading && !error && (
        <ul className="user-list">
          {showRecent && (
            <>
              <li className="section-label">Recent</li>
              {recent.map(({ conversation, user }) => (
                <li key={conversation.id}>
                  <PersonRow
                    user={user}
                    subtitle={conversation.lastMessage}
                    active={selectedUid === user.uid}
                    onClick={() => onSelect(user)}
                  />
                </li>
              ))}
            </>
          )}

          {people.length > 0 && (
            <>
              <li className="section-label">
                {term ? 'Results' : showRecent ? 'Everyone else' : 'Everyone'}
              </li>
              {people.map((u) => (
                <li key={u.uid}>
                  <PersonRow
                    user={u}
                    subtitle={u.email}
                    active={selectedUid === u.uid}
                    onClick={() => onSelect(u)}
                  />
                </li>
              ))}
            </>
          )}
        </ul>
      )}

      {!loading && !error && nothingToShow && (
        <p className="status">
          {term ? 'No one matches that search.' : 'No one else has joined yet.'}
        </p>
      )}
    </>
  );
}