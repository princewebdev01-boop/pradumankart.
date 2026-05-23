import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Home, Grid, ShoppingBag, Smartphone, Shirt, Tv, 
  Armchair, Zap, Heart, ShoppingCart, Info, User, 
  HelpCircle, Settings, LogOut, ChevronDown, ChevronRight,
  TrendingUp, Headphones, Camera, Gift, Globe, Store, Truck,
  Puzzle, Headphones as Support, Moon, Sun, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ITEMS = [
  { 
    name: 'Electronics', 
    icon: <Zap size={18} />, 
    subCategories: ['Mobiles', 'Laptops', 'Headphones', 'Cameras']
  },
  { 
    name: 'Fashion', 
    icon: <Shirt size={18} />, 
    subCategories: ['Men', 'Women', 'Kids']
  },
  { 
    name: 'Home & Furniture', 
    icon: <Armchair size={18} />, 
    subCategories: ['Sofa', 'Beds', 'Decor']
  },
  {
    name: 'Toys & More',
    icon: <Puzzle size={18} />,
    subCategories: ['Soft Toys', 'Educational', 'Remote Control', 'LEGO']
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isAdmin, logout } = useAuthStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would toggle a global theme or add 'dark' class to body
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[110] backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] md:w-[320px] bg-white z-[120] shadow-2xl overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="bg-[#00081d] text-white p-6 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center p-2 text-[#00081d] shadow-lg shadow-yellow-400/20">
                  <User size={28} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 leading-none mb-1">Welcome back</span>
                  <span className="text-lg font-bold uppercase tracking-tighter truncate max-w-[180px]">
                    {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Sign In')}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="py-4 pb-20">
              {/* Theme Toggle */}
              <div className="px-4 mb-4">
                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon size={20} className="text-blue-600" /> : <Sun size={20} className="text-yellow-500" />}
                    <span className="text-xs font-bold uppercase tracking-widest">{isDarkMode ? 'Dark Mode On' : 'Light Mode On'}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
              </div>

              {/* Main Links */}
              <div className="px-2 space-y-1">
                <SidebarItem icon={<Home size={20} />} label="Home" to="/" onClick={onClose} />
                <SidebarItem icon={<Grid size={20} />} label="All Categories" to="/shop" onClick={onClose} />
                <SidebarItem icon={<User size={20} />} label="User" to="/profile" onClick={onClose} highlight />
              </div>

              <div className="h-px bg-gray-100 my-6 mx-4" />

              {/* Shop by Category */}
              <div className="px-5 mb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Merchant Categories</h3>
              </div>
              
              <div className="px-2 space-y-1">
                {CATEGORY_ITEMS.map((cat) => (
                  <div key={cat.name}>
                    <button 
                      onClick={() => toggleCategory(cat.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${expandedCategory === cat.name ? 'bg-[#00081d] text-white shadow-xl' : 'hover:bg-gray-50 text-[#00081d]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={expandedCategory === cat.name ? 'text-yellow-400' : 'text-gray-400'}>
                          {cat.icon}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest">{cat.name}</span>
                      </div>
                      {expandedCategory === cat.name ? <ChevronDown size={14} /> : <ChevronRight size={14} className="opacity-30" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedCategory === cat.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-gray-50/50 mt-1 rounded-xl mx-2"
                        >
                          {cat.subCategories.map((sub) => (
                            <Link 
                              key={sub} 
                              to="/shop" 
                              onClick={onClose}
                              className="flex items-center gap-2 p-3 pl-10 text-[10px] font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest border-l-2 border-transparent hover:border-blue-600"
                            >
                               <div className="w-1 h-1 bg-current rounded-full opacity-20" /> {sub}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-100 my-6 mx-4" />

              {/* Other Links */}
              <div className="px-5 mb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Activity Hub</h3>
              </div>
              
              <div className="px-2 space-y-1">
                <SidebarItem icon={<TrendingUp size={20} />} label="Trending Products" to="/shop" onClick={onClose} />
                <SidebarItem icon={<Gift size={20} />} label="Coupons & Offers" to="/shop" onClick={onClose} />
                <SidebarItem icon={<Heart size={20} />} label="My Wishlist" to="/wishlist" onClick={onClose} />
                <SidebarItem icon={<ShoppingBag size={20} />} label="Orders History" to="/orders" onClick={onClose} />
                <SidebarItem icon={<Truck size={20} />} label="Order Tracking" to="/orders" onClick={onClose} />
                
                <div className="h-px bg-gray-100 my-4 mx-4" />
                <div className="px-5 mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Quick Categories</h3>
                </div>
                <SidebarItem icon={<Zap size={20} />} label="Electronics" to="/shop" onClick={onClose} />
                <SidebarItem icon={<Shirt size={20} />} label="Fashion" to="/shop" onClick={onClose} />
              </div>

              <div className="h-px bg-gray-100 my-6 mx-4" />

              {/* Support & Settings */}
              <div className="px-2 space-y-1">
                <SidebarItem icon={<Support size={20} />} label="Customer Support" to="/support" onClick={onClose} />
                <SidebarItem icon={<Settings size={20} />} label="Profile Settings" to="/profile" onClick={onClose} />
                {user && (
                  <button 
                    onClick={() => { logout(); onClose(); }}
                    className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 rounded-xl transition-all group mt-4 border-2 border-transparent hover:border-red-100"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                       <LogOut size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Log Out</span>
                  </button>
                )}
              </div>
            </div>

            {/* Legal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
               © 2026 PRADUMANKART Inc.<br />
               Refined E-Commerce Experience
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SidebarItem({ icon, label, to, onClick, highlight = false }: { icon: React.ReactNode, label: string, to: string, onClick: () => void, highlight?: boolean }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-4 p-3 rounded-xl transition-all group border-2 ${highlight ? 'bg-blue-50 border-blue-100 text-blue-600' : 'hover:bg-gray-50 border-transparent text-[#00081d]'}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${highlight ? 'bg-blue-600 text-white' : 'bg-gray-100 group-hover:bg-[#00081d] group-hover:text-white'}`}>
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest leading-none">{label}</span>
      {highlight && (
        <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </Link>
  );
}
