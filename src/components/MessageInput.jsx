import { useState } from 'react';
import { sendMessage } from '../services/chatService.js';

const MAX_LENGTH = 1000;

export default function MessageInput({ conversationId, senderId }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const trimmed = text.trim();
  const tooLong = text.length > MAX_LENGTH;
  const canSend = trimmed.length > 0 && !tooLong && !sending;

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    setError('');
    try {
      await sendMessage(conversationId, senderId, trimmed);
      setText('');
    } catch (err) {
      console.error(err);
      setError('Message not sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      {error && <p className="error-banner">{error}</p>}
      {tooLong && (
        <p className="field-error">Messages can be at most {MAX_LENGTH} characters.</p>
      )}
      <div className="input-row">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for a new line)"
          aria-label="Message"
        />
        <button className="btn btn-primary send-btn" type="submit" disabled={!canSend}>
          Send
        </button>
      </div>
    </form>
  );
}