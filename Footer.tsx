import { db } from './firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PRODUCTS } from '../constants';

export async function seedDatabase() {
  try {
    for (const product of PRODUCTS) {
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'products', product.id), productData);
    }
    console.log('Database seeded successfully');
  } catch (e) {
    console.error('Error seeding database:', e);
  }
}
