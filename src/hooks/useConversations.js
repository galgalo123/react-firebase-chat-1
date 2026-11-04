import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config.js';

function toMillis(timestamp) {
  if (!timestamp) return Date.now();
  return timestamp.toMillis ? timestamp.toMillis() : new Date(timestamp).getTime();
}

export function useConversations(uid) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!uid) return undefined;

    // Filtering on one field and sorting in the app avoids creating a Firestore index.
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))
          .sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
        setConversations(list);
      },
      (err) => console.error(err)
    );

    return () => unsubscribe();
  }, [uid]);

  return conversations;
}