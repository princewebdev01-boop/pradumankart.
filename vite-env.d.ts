import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { ShoppingCart, Zap, Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (e) {
        console.error('Error fetching product:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-blue-600 italic">Finding Perfection...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto text-red-500">
           <Sparkles size={40} />
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#00081d]">Product not found!</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">The item you're looking for might have moved or been sold out.</p>
        <Link to="/shop" className="inline-block bg-[#2874f0] text-white px-8 py-3 rounded-sm font-black uppercase tracking-widest shadow-xl">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-[#f1f3f6]">
      <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Images Column */}
          <div className="lg:w-2/5 space-y-6">
            <div className="bg-gray-50/50 border border-gray-100 p-10 flex items-center justify-center h-[350px] md:h-[450px] relative group overflow-hidden rounded-xl">
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                referrerPolicy="no-referrer"
              />
              <button className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-100 hover:bg-white transition-all">
                <Heart size={20} className="text-gray-300 hover:text-red-500 transition-colors" />
              </button>
              <div className="absolute top-4 left-4 bg-yellow-400 text-[#00081d] text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
                {product.discount}% OFF
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => addItem(product)}
                className="bg-blue-600 text-white py-4 font-black flex items-center justify-center gap-2 rounded-lg shadow-xl hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-wider text-sm"
              >
                <ShoppingCart size={20} className="fill-current" /> Add to Cart
              </button>
              <button 
                onClick={() => {
                  addItem(product);
                  navigate('/checkout');
                }}
                className="bg-[#fb641b] text-white py-4 font-black flex items-center justify-center gap-2 rounded-lg shadow-xl hover:bg-[#e65a15] transition-all active:scale-95 uppercase tracking-wider text-sm"
              >
                <Zap size={20} className="fill-current" /> Buy Now
              </button>
            </div>
          </div>

          {/* Info Column */}
          <div className="lg:w-3/5 space-y-8">
            <nav className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span className="opacity-30">/</span>
              <span className="hover:text-blue-600 cursor-pointer">{product.category}</span>
              <span className="opacity-30">/</span>
              <span className="text-gray-300 truncate">{product.name}</span>
            </nav>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#00081d] leading-tight mb-3 uppercase italic tracking-tighter">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-green-600 text-white text-[12px] px-2 py-1 rounded-sm font-black">
                  {product.rating} <Star size={12} fill="currentColor" />
                </div>
                <span className="text-xs text-gray-500 font-black uppercase tracking-wider underline cursor-pointer">{product.reviewCount.toLocaleString()} Reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-[#00081d]">₹{product.price.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 line-through font-bold text-gray-400">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="text-xs text-green-600 font-black uppercase tracking-widest">{product.discount}% off</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-400">Limited Time Offers</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <Zap size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-700 font-bold leading-tight">10% off on HDFC Bank Credit Card Transactions, up to ₹1,250 on orders above ₹5,000</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <Zap size={16} className="text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700 font-bold leading-tight">Extra ₹500 off on HDFC Bank Credit Card EMI Transactions on 9+ months tenure</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-[#00081d]">Description</h4>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{product.description}</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-[#00081d]">Highlights</h4>
                <ul className="text-sm text-gray-600 space-y-2 list-none font-bold">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Premium build quality</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Latest tech integration</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Energy efficient</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> 1 Year Brand Warranty</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#00081d] p-6 rounded-xl text-white flex items-center gap-6 group shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 blur-3xl -mr-16 -mt-16" />
               <ShieldCheck size={40} className="text-yellow-400 shrink-0" />
               <div>
                 <h4 className="font-black text-sm uppercase tracking-wider text-yellow-400">PRADUMANKART Shield</h4>
                 <p className="text-[11px] text-gray-300 font-bold mt-1 uppercase leading-tight">100% genuine products • Easy returns • Secured checkout</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
