import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, ShoppingBag, Heart, Bell, Settings, 
  LogOut, Gift, CreditCard, Shield, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    navigate('/');
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
  };

  return (
    <div 
      className="relative z-[100]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all ${isOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}>
        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center p-1.5 shadow-lg shadow-yellow-400/20">
           <User size={20} className="text-[#00081d] fill-current" />
        </div>
        <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
          <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">My Account</span>
          <span className="text-sm font-black italic uppercase tracking-tighter truncate max-w-[100px]">
            {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Profile'}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white p-2">
                 <User size={24} />
              </div>
              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="text-sm font-black text-[#00081d] uppercase italic truncate">{user?.displayName || 'User'}</span>
                <span className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</span>
              </div>
            </div>

            {/* Menu */}
            <div className="p-2">
              <DropdownLink to="/profile" icon={<User size={18} />} label="My Profile" />
              <DropdownLink to="/orders" icon={<ShoppingBag size={18} />} label="Orders" />
              <DropdownLink to="/wishlist" icon={<Heart size={18} />} label="Wishlist" />
              <DropdownLink to="/notifications" icon={<Bell size={18} />} label="Notifications" badge="4" />
              
              {isAdmin && (
                <div className="mt-2 p-2 pt-0">
                  <Link 
                    to="/secure-admin-dashboard" 
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-600 group transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white group-hover:bg-white group-hover:text-blue-600 transition-all shadow-lg shadow-blue-600/20">
                      <Shield size={16} />
                    </div>
                    <span className="text-xs font-black text-blue-600 group-hover:text-white uppercase tracking-widest italic flex-grow">Admin Dashboard</span>
                  </Link>
                </div>
              )}
              
              <div className="h-px bg-gray-100 my-2 mx-2" />
              
              <DropdownLink to="/rewards" icon={<Gift size={18} />} label="Rewards & Offers" color="text-purple-600" />
              <DropdownLink to="/payment" icon={<CreditCard size={18} />} label="Payment Options" />
              
              <div className="h-px bg-gray-100 my-2 mx-2" />
              
              <DropdownLink to="/profile" icon={<Settings size={18} />} label="Settings" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100/50 group-hover:bg-red-500 group-hover:text-white transition-all">
                  <LogOut size={16} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest italic">Logout Account</span>
              </button>
            </div>
            
            {/* Footer Tip */}
            <div className="p-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest text-center">
               New 50% Offers Available Today!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownLink({ to, icon, label, badge, color = 'text-gray-400' }: { to: string, icon: React.ReactNode, label: string, badge?: string, color?: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 transition-all group-hover:bg-blue-600 group-hover:text-white ${color}`}>
        {icon}
      </div>
      <span className="text-xs font-black text-[#00081d] uppercase tracking-widest italic flex-grow">{label}</span>
      {badge ? (
        <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>
      ) : (
        <ChevronRight size={14} className="text-gray-200 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
      )}
    </Link>
  );
}
