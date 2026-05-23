import { useWishlistStore } from '../store/useWishlistStore';
import ProductCard from '../components/common/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { items } = useWishlistStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-red-500 fill-current" size={28} />
        <h1 className="text-2xl font-bold text-[#212121]">My Wishlist</h1>
        <span className="text-gray-500 font-medium">({items.length} items)</span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Heart size={48} className="text-gray-200" />
          </div>
          <p className="text-xl font-bold text-[#212121] mb-2">Your wishlist is empty!</p>
          <p className="text-gray-500 mb-8 max-w-sm text-center">
            Explore more and shortlist some items to see them here.
          </p>
          <Link 
            to="/shop" 
            className="bg-[#2874f0] text-white px-8 py-3 font-bold rounded-sm shadow-md hover:bg-blue-700 transition-colors uppercase tracking-wide"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
