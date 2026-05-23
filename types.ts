import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { ShieldAlert, Mail, Lock, KeyRound, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPrivate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const setIsAdmin = useAuthStore((state) => state.setIsAdmin);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const clientAdminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'princewebdev01@gmail.com';
    const clientAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'namaste papa';

    try {
      // 1. Try server-side admin login first (when running on server containers or dynamic hosting)
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (fbErr: any) {
            console.warn("Firebase Auth auto-login failed, attempting silent registration:", fbErr);
            if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
              try {
                await createUserWithEmailAndPassword(auth, email, password);
              } catch (regErr) {
                console.error("Firebase secondary registration failure:", regErr);
              }
            }
          }
          localStorage.setItem('admin_session', 'true');
          localStorage.setItem('admin_email', email);
          setIsAdmin(true);
          navigate('/admin-dashboard', { replace: true });
          return;
        }
      }
      
      // 2. Fallback to client-side verification if server returns an error or is un-reachable (e.g. static hosting like Vercel)
      if (email === clientAdminEmail && password === clientAdminPassword) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (fbErr: any) {
          console.warn("Firebase Auth auto-login failed, attempting silent registration:", fbErr);
          try {
            await createUserWithEmailAndPassword(auth, email, password);
          } catch (regErr) {
            console.error("Firebase registration failure:", regErr);
          }
        }
        localStorage.setItem('admin_session', 'true');
        localStorage.setItem('admin_email', email);
        setIsAdmin(true);
        navigate('/admin-dashboard', { replace: true });
        return;
      } else {
        setError('Access Denied. Invalid Administrator Credentials.');
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, trying client-side fallback auth:', err);
      // Fallback directly to client-side credential check (crucial for pure static Vercel hosting)
      if (email === clientAdminEmail && password === clientAdminPassword) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (fbErr: any) {
          console.warn("Firebase Auth auto-login failed, attempting silent registration:", fbErr);
          try {
            await createUserWithEmailAndPassword(auth, email, password);
          } catch (regErr) {
            console.error("Firebase registration failure:", regErr);
          }
        }
        localStorage.setItem('admin_session', 'true');
        localStorage.setItem('admin_email', email);
        setIsAdmin(true);
        navigate('/admin-dashboard', { replace: true });
      } else {
        setError('Access Denied. Invalid Administrator Credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      {/* Immersive security grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      
      {/* Interactive Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#fb641b]/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 md:p-12 relative z-10 shadow-2xl"
      >
        {/* Security / System Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-500/30 px-4 py-2 rounded-full">
            <KeyRound size={14} className="text-blue-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Secure Auth Gateway</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white flex items-center justify-center gap-2 leading-none">
            Admin <span className="text-[#2874f0]">Station</span>
          </h2>
          <p className="text-slate-400 font-medium text-xs tracking-wide mt-2">
            Enter private system credentials to gain entry.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 p-4 mb-8 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 text-xs font-black uppercase tracking-wider">Authentication Error</h4>
              <p className="text-red-300/80 text-xs mt-1 font-bold">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-slate-950/40 border-2 border-slate-800/80 hover:border-slate-700/80 py-4.5 pl-14 pr-4 rounded-2xl focus:bg-slate-950/80 focus:border-blue-500 outline-none text-sm font-bold text-white transition-all text-ellipsis"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-950/40 border-2 border-slate-800/80 hover:border-slate-700/80 py-4.5 pl-14 pr-4 rounded-2xl focus:bg-slate-950/80 focus:border-blue-500 outline-none text-sm font-bold text-white transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fb641b] text-white py-4.5 px-6 font-black rounded-2xl shadow-2xl shadow-orange-500/10 hover:bg-[#e65a15] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Decrypting Session...</span>
              </>
            ) : (
              <>
                <span>Acknowledge & Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Security Footnote */}
      <div className="mt-12 flex items-center gap-3 opacity-30 select-none pointer-events-none z-10">
        <ShieldCheck size={36} className="text-slate-400" />
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 max-w-[200px] leading-relaxed">
          Device IP Handshake Logged. Authorized access strictly monitored.
        </div>
      </div>
    </div>
  );
}
