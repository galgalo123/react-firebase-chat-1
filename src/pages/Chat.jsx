import { useState } from 'react';
import UserList from '../components/UserList.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <main className={`chat-layout ${selectedUser ? 'has-selection' : ''}`}>
      <aside className="sidebar">
        <UserList selectedUid={selectedUser?.uid} onSelect={setSelectedUser} />
      </aside>

      <section className="main-panel">
        {selectedUser ? (
          <ChatWindow
            key={selectedUser.uid}
            otherUser={selectedUser}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <div className="empty-state">
            <h2>Select a classmate</h2>
            <p>Choose someone from the list to start a conversation.</p>
          </div>
        )}
      </section>
    </main>
  );
}