import { db } from './firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

export async function generateOrderId() {
  const counterRef = doc(db, 'orderCounters', 'main');
  
  return await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    
    let nextId = 1001;
    if (counterDoc.exists()) {
      nextId = counterDoc.data().current + 1;
    }
    
    transaction.set(counterRef, { current: nextId }, { merge: true });
    return `PK${nextId}`;
  });
}

export async function registerUTR(orderId: string, utr: string, userId: string) {
  const utrRef = doc(db, 'transactions', utr);
  
  await runTransaction(db, async (transaction) => {
    const utrDoc = await transaction.get(utrRef);
    if (utrDoc.exists()) {
      throw new Error('This Transaction ID (UTR) has already been used. Please check and try again.');
    }
    
    transaction.set(utrRef, {
      utr,
      orderId,
      userId,
      createdAt: serverTimestamp()
    });
  });
}
