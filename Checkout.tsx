import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query as firestoreQuery, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/common/ProductCard';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const queryParam = searchParams.get('q');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = firestoreQuery(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        let filtered = productsData;
        if (category) {
          filtered = filtered.filter(p => p.category === category);
        }
        if (queryParam) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(queryParam.toLowerCase()));
        }
        
        setProducts(filtered);
      } catch (e) {
        console.error('Error fetching products:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, queryParam]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-blue-600 italic">Searching Products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#00081d] italic uppercase tracking-tighter">
            {category ? category : queryParam ? `Search results for "${queryParam}"` : 'All Products'}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{products.length} products found</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
           <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sort By</span>
           <select className="text-xs font-black focus:outline-none bg-transparent cursor-pointer uppercase tracking-tight">
              <option>Popularity</option>
              <option>Price -- Low to High</option>
              <option>Price -- High to Low</option>
              <option>Newest First</option>
           </select>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-xl border border-dashed border-gray-200">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🔍</span>
           </div>
           <p className="text-xl font-black text-[#00081d] uppercase italic tracking-tighter">No products found</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 text-center max-w-xs">
             Try adjusting your filters or search keywords to find what you're looking for.
           </p>
        </div>
      )}
    </div>
  );
}
