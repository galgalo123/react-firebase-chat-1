import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

export function getConversationId(uidA, uidB) {
  return [uidA, uidB].sort().join('_');
}

export async function fetchUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function getOrCreateConversation(currentUid, otherUid) {
  const participants = [currentUid, otherUid].sort();
  const conversationId = participants.join('_');
  const ref = doc(db, 'conversations', conversationId);

  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(ref, {
      participants,
      lastMessage: '',
      updatedAt: serverTimestamp(),
    });
  }

  return conversationId;
}

export async function sendMessage(conversationId, senderId, rawText) {
  const text = rawText.trim();
  if (!text) throw new Error('Message is empty.');

  const batch = writeBatch(db);

  const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
  batch.set(messageRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });

  batch.update(doc(db, 'conversations', conversationId), {
    lastMessage: text.slice(0, 200),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function editMessage(conversationId, messageId, rawText) {
  const text = rawText.trim();
  if (!text) throw new Error('Message is empty.');

  await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
    text,
    editedAt: serverTimestamp(),
  });
}

export async function deleteMessage(conversationId, messageId) {
  await deleteDoc(doc(db, 'conversations', conversationId, 'messages', messageId));
}