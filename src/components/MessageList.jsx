import { useEffect, useRef, useState } from 'react';

function formatTime(timestamp) {
  if (!timestamp) return 'Sending…';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageList({ messages, loading, error, currentUid }) {
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const [nearBottom, setNearBottom] = useState(true);

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

  if (loading) {
    return <p className="status">Loading messages…</p>;
  }

  if (error) {
    return <p className="error-banner">{error}</p>;
  }

  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <p>No messages yet. Say hello 👋</p>
      </div>
    );
  }

  return (
    <div className="message-list" ref={listRef} onScroll={handleScroll}>
      {messages.map((message) => {
        const mine = message.senderId === currentUid;
        return (
          <div key={message.id} className={`bubble-row ${mine ? 'mine' : 'theirs'}`}>
            <div className="bubble">
              <p>{message.text}</p>
              <span className="time">{formatTime(message.createdAt)}</span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}