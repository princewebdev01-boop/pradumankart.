import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';

export default function BottomNav() {
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2 px-1 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <NavLink 
        to="/" 
        className={({ isActive }) => `flex flex-col items-center gap-0.5 min-w-[64px] ${isActive ? 'text-[#00081d]' : 'text-gray-500'}`}
      >
        {({ isActive }) => (
          <>
            <Home size={22} className={isActive ? 'fill-[#00081d]' : ''} />
            <span className="text-[10px] font-bold">Home</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/shop" 
        className={({ isActive }) => `flex flex-col items-center gap-0.5 min-w-[64px] ${isActive ? 'text-[#00081d]' : 'text-gray-500'}`}
      >
        {({ isActive }) => (
          <>
            <Search size={22} className={isActive ? 'fill-[#00081d]' : ''} />
            <span className="text-[10px] font-bold">Shop</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/wishlist" 
        className={({ isActive }) => `flex flex-col items-center gap-0.5 min-w-[64px] ${isActive ? 'text-[#00081d]' : 'text-gray-500'}`}
      >
        {({ isActive }) => (
          <>
            <Heart size={22} className={isActive ? 'fill-[#00081d]' : ''} />
            <span className="text-[10px] font-bold">Wishlist</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/cart" 
        className={({ isActive }) => `flex flex-col items-center gap-0.5 min-w-[64px] relative ${isActive ? 'text-[#00081d]' : 'text-gray-500'}`}
      >
        {({ isActive }) => (
          <>
            <ShoppingCart size={22} className={isActive ? 'fill-[#00081d]' : ''} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-3 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                {totalItems}
              </span>
            )}
            <span className="text-[10px] font-bold">Cart</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `flex flex-col items-center gap-0.5 min-w-[64px] ${isActive ? 'text-[#00081d]' : 'text-gray-500'}`}
      >
        {({ isActive }) => (
          <>
            <User size={22} className={isActive ? 'fill-[#00081d]' : ''} />
            <span className="text-[10px] font-bold">Account</span>
          </>
        )}
      </NavLink>
    </div>
  );
}
