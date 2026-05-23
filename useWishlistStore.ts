import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { LogIn, ArrowLeft, ShieldCheck, Mail, Lock, Sparkles, ChevronRight, ShoppingCart, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setIsAdmin = useAuthStore((state) => state.setIsAdmin);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const loginWithEmail = useAuthStore((state) => state.loginWithEmail);

  const from = location.state?.from || '/';

  const isPrivateAdminEntry = location.pathname === '/admin-login-private';

  const [showProviderInfo, setShowProviderInfo] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // If it's a private admin entry, we use the server-side JWT auth
      if (isPrivateAdminEntry) {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (data.success) {
          setIsAdmin(true);
          navigate('/secure-admin-dashboard');
          return;
        } else {
          setError(data.error || 'Invalid admin credentials');
          setLoading(false);
          return;
        }
      }

      // Standard Firebase login
      const success = await loginWithEmail(email, password);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase.');
        setShowProviderInfo(true);
      } else {
        setError(err.message || 'Login failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginAction = async () => {
    setLoading(true);
    setError('');
    setShowProviderInfo(false);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Google login failed or access denied');
      }
    } catch (e: any) {
      console.error('Google Login Error:', e);
      if (e.code === 'auth/operation-not-allowed') {
        setError('Google Login is not enabled in Firebase. Please enable it in your Console.');
        setShowProviderInfo(true);
      } else if (e.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups.');
      } else {
        setError(e.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f1f3f6] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 opacity-10 blur-3xl -ml-48 -mt-48 rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#fb641b] opacity-10 blur-3xl -mr-48 -mb-48 rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 relative z-10"
      >
        {/* Left Side: Brand & Visual */}
        <div className="bg-[#00081d] text-white p-12 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400 opacity-10 blur-3xl -ml-16 -mb-16" />
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors mb-12">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">
              {isPrivateAdminEntry ? 'Admin' : 'Welcome'} <span className="text-blue-500">{isPrivateAdminEntry ? 'Portal' : 'PradumanKart'}</span>
            </h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
              {isPrivateAdminEntry 
                ? 'Secured management interface for authorized personnel only.' 
                : 'Unlock the best deals on electronics, fashion, and more. Your shortcut to premium shopping.'}
            </p>
          </div>

          <div className="relative mt-8 group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#00081d] to-transparent z-10" />
            <img 
              src={isPrivateAdminEntry 
                ? "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=400" 
                : "https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/login_img_c4a81e.png"} 
              alt="Login Visual" 
              className="w-full grayscale opacity-40 group-hover:opacity-60 transition-opacity duration-700 aspect-square object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 z-20 text-center">
              <div className="inline-block bg-yellow-400 text-[#00081d] p-3 rounded-xl shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                <ShoppingCart size={32} className="fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 flex-grow bg-white">
          <div className="mb-10">
             <h3 className="text-2xl font-black text-[#00081d] uppercase italic tracking-tighter">
               {isPrivateAdminEntry ? 'Private Entrance' : 'Account Access'}
             </h3>
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
               {isPrivateAdminEntry ? 'Encrypted Session Required' : 'Please enter your credentials below'}
             </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg"
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-red-700 text-xs font-bold uppercase tracking-tight">{error}</p>
                  {showProviderInfo && (
                    <div className="mt-2 p-2 bg-white/50 rounded border border-red-100 text-[10px] leading-relaxed text-red-600">
                      To fix this: Go to <a href="https://console.firebase.google.com/" target="_blank" className="underline">Firebase Console</a> &gt; Build &gt; Authentication &gt; Settings &gt; Sign-in method and enable <strong>Google</strong> provider.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email or Phone</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                  placeholder="Enter your address"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent py-4 pl-12 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                  placeholder="Keep it secret"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Forgot password?</button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#fb641b] text-white py-4 font-black rounded-xl shadow-xl shadow-orange-500/10 hover:bg-[#e65a15] transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Sign In'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-gray-300">Or Continue with Social</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLoginAction}
            disabled={loading}
            className="w-full bg-white text-[#00081d] py-4 font-black rounded-xl shadow-sm border-2 border-gray-100 flex items-center justify-center gap-3 hover:border-blue-600 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google Login
          </button>

          <div className="text-center mt-12 bg-gray-50 p-4 rounded-xl border border-gray-100">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
               New to PRADUMANKART? <Link to="/signup" className="text-blue-600 hover:underline">Create an account</Link>
             </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 flex items-center gap-6 opacity-30 select-none pointer-events-none">
         <ShieldCheck size={40} className="text-gray-400" />
         <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 max-w-[200px]">
           Secured by Bank-Grade RSA Encryption Protocols. 
         </div>
      </div>
    </div>
  );
}
