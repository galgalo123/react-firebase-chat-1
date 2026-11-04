import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessages } from '../hooks/useMessages.js';
import { getOrCreateConversation } from '../services/chatService.js';
import MessageList from './MessageList.jsx';
import MessageInput from './MessageInput.jsx';

export default function ChatWindow({ otherUser, onBack }) {
  const { currentUser } = useAuth();
  const [conversationId, setConversationId] = useState(null);
  const [opening, setOpening] = useState(true);
  const [openError, setOpenError] = useState('');
  const { messages, loading, error } = useMessages(conversationId);

  useEffect(() => {
    let cancelled = false;
    setOpening(true);
    setOpenError('');
    setConversationId(null);

    getOrCreateConversation(currentUser.uid, otherUser.uid)
      .then((id) => {
        if (!cancelled) setConversationId(id);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setOpenError('Could not open this conversation. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setOpening(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser.uid, otherUser.uid]);

  const initial = (otherUser.displayName || otherUser.email || '?')[0].toUpperCase();

  return (
    <div className="chat-window">
      <header className="chat-header">
        <button className="btn btn-ghost back-btn" onClick={onBack} aria-label="Back to people">
          ←
        </button>
        <span className="avatar">{initial}</span>
        <div className="chat-title">
          <strong>{otherUser.displayName || 'Unnamed user'}</strong>
          <span className="muted small">{otherUser.email}</span>
        </div>
      </header>

      {opening && <p className="status">Opening conversation…</p>}
      {openError && <p className="error-banner">{openError}</p>}

      {conversationId && (
        <>
          <MessageList
  conversationId={conversationId}
  messages={messages}
  loading={loading}
  error={error}
  currentUid={currentUser.uid}
/>
          <MessageInput conversationId={conversationId} senderId={currentUser.uid} />
        </>
      )}
    </div>
  );
}