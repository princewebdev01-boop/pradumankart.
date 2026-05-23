import React, { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import Skeleton from './Skeleton';
import { cn } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const user = useAuthStore((state) => state.user);
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLiked = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      // Typically we'd show the login modal here
      return;
    }
    if (isLiked) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const fallbackImage = 'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/placeholder/2022/2/15/d43c2c5a-52f5-46b7-862d-0b1297e682d31644919502758-Placeholder-Vertical.jpg';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white h-full flex flex-col relative group border border-gray-100 hover:shadow-[0_15px_30px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-sm overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="flex-grow flex flex-col p-3">
        <div className="h-44 md:h-52 w-full flex items-center justify-center mb-3 overflow-hidden relative bg-white">
          <AnimatePresence>
            {!isImageLoaded && !imageError && (
              <div className="absolute inset-0 z-10">
                <Skeleton className="w-full h-full" />
              </div>
            )}
          </AnimatePresence>

          <img 
            src={imageError ? fallbackImage : product.images[0]} 
            alt={product.name} 
            className={cn(
              "max-h-full max-w-full object-contain transition-all duration-500 opacity-100 scale-100 group-hover:scale-110"
            )}
            referrerPolicy="no-referrer"
            loading="eager"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setIsImageLoaded(true);
            }}
          />
          
          {/* Wishlist Icon */}
          <button 
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-0 right-0 p-2 transition-all duration-300 z-20",
              isLiked ? "text-red-500" : "text-gray-300 hover:text-red-500"
            )}
          >
            <Heart size={20} className={isLiked ? "fill-current" : ""} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-[14px] font-medium text-gray-800 line-clamp-1 group-hover:text-[#2874f0] transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
              {product.rating} <Star size={10} fill="currentColor" />
            </div>
            <span className="text-[12px] text-gray-500 font-medium">({product.reviewCount.toLocaleString()})</span>
            {product.isAssured && (
              <img 
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" 
                alt="Assured" 
                className="h-4 ml-auto" 
              />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-[#212121]">₹{product.price.toLocaleString()}</span>
            <span className="text-[12px] text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
            <span className="text-[12px] text-green-600 font-bold">{product.discount}% off</span>
          </div>
        </div>
      </Link>

      <div className="p-3 pt-0 mt-auto">
        <button 
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
          }}
          className="w-full py-2.5 bg-[#fb641b] text-white text-[13px] font-bold rounded-sm hover:bg-[#e65a12] transition-colors shadow-sm flex items-center justify-center gap-2 uppercase tracking-wide"
        >
          <ShoppingCart size={16} className="fill-current" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
