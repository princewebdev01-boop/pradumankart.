import { useState, useEffect } from 'react';
import { Menu, ShoppingCart, Bell, Heart, Package, LayoutDashboard, ChevronDown, User, Plus, Search, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import Sidebar from './Sidebar';
import SearchBar from '../search/SearchBar';
import ProfileDropdown from '../profile/ProfileDropdown';
import LoginModal from '../auth/LoginModal';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin, loginWithGoogle } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-[#2874f0] text-white shadow-md">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex h-16 items-center gap-4 lg:gap-10">
            {/* Left: Hamburger & Logo */}
            <div className="flex items-center gap-2">
              {!isHome && (
                <button 
                  onClick={() => navigate(-1)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
                  aria-label="Go Back"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
              
              <Link to="/" className="flex flex-col ml-1">
                <span className="text-xl md:text-2xl font-black tracking-tight leading-none italic uppercase">PradumanKart</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold italic text-gray-100/80 tracking-tight">Explore</span>
                  <span className="text-[10px] font-bold italic text-[#ffe500] flex items-center">
                    Plus <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/plus_aef861.png" alt="" className="h-2.5 ml-0.5" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-grow hidden md:block max-w-2xl mx-auto">
               <div className="flex h-10 w-full bg-white rounded-sm shadow-sm overflow-hidden border border-gray-100">
                  <SearchBar />
                  <button className="bg-yellow-400 text-[#00081d] px-8 font-bold flex items-center justify-center hover:bg-yellow-500 transition-colors">
                    <Search size={18} />
                  </button>
               </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 lg:gap-8">
              {user ? (
                <div className="relative group">
                  <button className="hidden lg:flex items-center gap-1 font-bold text-sm hover:opacity-90">
                    <span>{user.email?.split('@')[0]}</span>
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full right-0 mt-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <ProfileDropdown />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-white text-[#2874f0] px-6 py-1.5 font-bold rounded-sm text-sm hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    Login
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        await loginWithGoogle();
                      } catch (err) {
                        console.error(err);
                        navigate('/login');
                      }
                    }}
                    className="hidden xl:flex items-center gap-2 bg-yellow-400 text-[#00081d] px-4 py-1.5 font-bold rounded-sm text-sm hover:bg-yellow-500 transition-colors shadow-sm whitespace-nowrap"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}

              <Link to="/wishlist" className="hidden lg:flex items-center gap-2 font-bold text-sm hover:opacity-90 group relative">
                <div className="relative">
                  <Heart size={20} className="group-hover:scale-110 transition-transform" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-[#2874f0] shadow-md">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span>Wishlist</span>
              </Link>

              <Link to="/orders" className="hidden lg:flex items-center gap-2 font-bold text-sm hover:opacity-90 group">
                <Package size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                <span>Orders</span>
              </Link>

              <Link to="/cart" className="flex items-center gap-2 font-bold text-sm hover:opacity-90 group relative">
                <div className="relative">
                  <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-[#2874f0] shadow-md">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">Cart</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
           <div className="relative flex h-9 w-full rounded-sm overflow-hidden shadow-inner">
              <input 
                type="text" 
                placeholder="Search products..."
                className="flex-grow h-full bg-white text-gray-800 px-3 focus:outline-none text-xs"
              />
              <button className="h-full bg-white px-3 flex items-center justify-center border-l">
                <Search size={16} className="text-[#2874f0]" />
              </button>
           </div>
        </div>
      </nav>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
