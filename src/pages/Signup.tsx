import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { UserPlus, ArrowLeft, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';

export default function Signup() {
  const [displayName, setDisplayName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const registerWithEmail = useAuthStore((state) => state.registerWithEmail);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
        setError('Please enter a valid 10-digit mobile number');
        return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await registerWithEmail(email, password, displayName, mobile);
      if (success) {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f1f3f6] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#00081d]">Join PradumanKart</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Start your premium shopping journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-red-700 text-xs font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
             <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                  placeholder="Enter your full name"
                  required
                />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mobile Number</label>
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                  placeholder="Enter your email"
                  required
                />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                  placeholder="Choose a strong password"
                  required
                />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirm Password</label>
             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                  placeholder="Repeat your password"
                  required
                />
             </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#2874f0] text-white py-4 font-black rounded-xl shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center mt-8">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
             Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
           </p>
        </div>
      </motion.div>
    </div>
  );
}
