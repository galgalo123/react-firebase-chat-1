import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config.js';

const PAGE_SIZE = 100;

export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');

    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))
          .reverse();
        setMessages(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Could not load messages. Check your connection and try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  return { messages, loading, error };
}