import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, ShoppingCart, ArrowRight } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, loginWithGoogle } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-[850px] min-h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#00081d] z-10 p-2 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Left Side - Info */}
              <div className="bg-[#00081d] text-white p-10 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 blur-3xl rounded-full -ml-32 -mb-32" />
                
                <div className="relative z-10">
                  <h2 className="text-4xl font-black italic uppercase italic tracking-tighter mb-4 leading-none">
                    Login to <br />
                    <span className="text-yellow-400 not-italic">PRADUMANKART</span>
                  </h2>
                  <p className="text-gray-400 text-sm font-bold uppercase leading-relaxed tracking-wider opacity-80">
                    Get access to your Orders, Wishlist and Recommendations
                  </p>
                </div>

                <div className="relative z-10 mt-auto space-y-6">
                   <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center p-3 shadow-2xl shadow-yellow-400/20">
                      <ShoppingCart size={40} className="text-[#00081d] fill-current" />
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yellow-400">
                         <ArrowRight size={14} /> Free delivery
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50">
                         <ArrowRight size={14} /> Secure payments
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="p-8 md:p-12 md:w-3/5 bg-white">
                <form onSubmit={handleLogin} className="space-y-6 max-w-sm mx-auto">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input 
                          type="email" 
                          placeholder="Enter your email"
                          className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:bg-white text-sm font-bold transition-all"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-blue-600 focus:bg-white text-sm font-bold transition-all"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">Remember me</span>
                    </label>
                    <button type="button" className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:underline">Forgot?</button>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-[10px] font-black uppercase tracking-widest leading-tight border border-red-100">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#fb641b] text-white py-4 font-black rounded-xl shadow-xl hover:bg-[#e65a15] transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Logging in...' : 'Login to Continue'}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100 italic font-black"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-white px-4 text-gray-300">OR</span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-[#00081d] py-4 font-black rounded-xl shadow-sm border-2 border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all uppercase tracking-widest active:scale-95"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                    Continue with Google
                  </button>

                  <div className="text-center">
                    <button type="button" className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors">
                      New to PradumanKart? Create account
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
