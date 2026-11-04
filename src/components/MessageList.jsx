import { useEffect, useRef, useState } from 'react';
import { deleteMessage, editMessage } from '../services/chatService.js';

function toDate(timestamp) {
  if (!timestamp) return null;
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
}

function dayLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageList({
  conversationId,
  messages,
  loading,
  error,
  currentUid,
}) {
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const [nearBottom, setNearBottom] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const [actionError, setActionError] = useState('');

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setNearBottom(distanceFromBottom < 80);
  };

  useEffect(() => {
    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, nearBottom]);

  const startEdit = (message) => {
    setEditingId(message.id);
    setDraft(message.text);
    setActionError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft('');
  };

  const saveEdit = async (message) => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setActionError('A message cannot be empty.');
      return;
    }
    if (trimmed === message.text) {
      cancelEdit();
      return;
    }
    try {
      await editMessage(conversationId, message.id, trimmed);
      cancelEdit();
    } catch (err) {
      console.error(err);
      setActionError('Could not save your edit. Please try again.');
    }
  };

  const removeMessage = async (message) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(conversationId, message.id);
    } catch (err) {
      console.error(err);
      setActionError('Could not delete that message.');
    }
  };

  const handleEditKey = (e, message) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit(message);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (loading) {
    return <p className="status">Loading messages…</p>;
  }

  if (error) {
    return <p className="error-banner">{error}</p>;
  }

  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👋</div>
        <h2>No messages yet</h2>
        <p>Say hello to start the conversation.</p>
      </div>
    );
  }

  const rows = [];
  let lastLabel = null;

  messages.forEach((message) => {
    const date = toDate(message.createdAt);

    if (date) {
      const label = dayLabel(date);
      if (label !== lastLabel) {
        rows.push(
          <div key={`day-${message.id}`} className="day-divider">
            <span>{label}</span>
          </div>
        );
        lastLabel = label;
      }
    }

    const mine = message.senderId === currentUid;
    const isEditing = editingId === message.id;

    rows.push(
      <div key={message.id} className={`bubble-row ${mine ? 'mine' : 'theirs'}`}>
        <div className="bubble">
          {isEditing ? (
            <div className="edit-box">
              <textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => handleEditKey(e, message)}
                autoFocus
              />
              <div className="edit-actions">
                <button className="msg-action" onClick={cancelEdit}>
                  Cancel
                </button>
                <button className="msg-action" onClick={() => saveEdit(message)}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>{message.text}</p>
              <span className="time">
                {message.editedAt && <span className="edited">edited · </span>}
                {date ? formatTime(date) : 'Sending…'}
              </span>
              {mine && (
                <div className="msg-actions">
                  <button className="msg-action" onClick={() => startEdit(message)}>
                    Edit
                  </button>
                  <button
                    className="msg-action danger"
                    onClick={() => removeMessage(message)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  });

  return (
    <>
      {actionError && <p className="action-error">{actionError}</p>}
      <div className="message-list" ref={listRef} onScroll={handleScroll}>
        {rows}
        <div ref={bottomRef} />
      </div>
    </>
  );
}