import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, ShoppingCart, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { auth, activeFirebaseConfig } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
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
    setError('');
    setUnauthorizedDomain(false);
    setPopupBlocked(false);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google Login Error:', err);
      const isPopupError = err.code === 'auth/popup-blocked' || 
                           err.code === 'auth/cancelled-popup-request' || 
                           (err.message && (err.message.includes('popup-blocked') || err.message.includes('cancelled-popup-request')));

      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setError('Google Login Error: Firebase has blocked this domain as Unauthorized. Please add this domain in Firebase Console.');
        setUnauthorizedDomain(true);
      } else if (isPopupError) {
        setError('Google Login Popup Error: The popup was either blocked by your browser or cancelled.');
        setPopupBlocked(true);
      } else {
        setError(err.message || 'Google login failed');
      }
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
                    <div className="space-y-3">
                      <div className="bg-red-50 text-red-500 p-3 rounded-lg text-[10px] font-black uppercase tracking-widest leading-tight border border-red-100 flex items-start gap-1.5">
                        <AlertCircle size={14} className="shrink-0 text-red-500 mt-0.5" />
                        <span>{error}</span>
                      </div>
                      
                      {unauthorizedDomain && (
                        <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-lg text-left text-[11px] leading-relaxed text-orange-950 space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar shadow-sm">
                          <div className="flex items-center gap-1.5 border-b border-orange-100 pb-1.5">
                            <Sparkles className="text-orange-500 animate-pulse" size={14} />
                            <h4 className="font-bold text-[#00081d] text-xs uppercase tracking-tight">🚨 Unauthorized Domain Solution (हिन्दी):</h4>
                          </div>
                          
                          <p className="font-semibold text-gray-700 font-sans text-[10.5px]">
                            इस आसान तरीके से एरर ठीक करें:
                          </p>
                          
                          <ol className="list-decimal list-inside space-y-1 text-gray-700 font-medium text-[10.5px]">
                            <li>अपने <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-extrabold">Firebase Console</a> में जाएँ।</li>
                            <li>प्रोजेक्ट <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono font-bold text-[10px]">{activeFirebaseConfig.projectId}</code> को चुनें।</li>
                            <li>लेफ्ट साइडबार में <strong className="font-bold text-gray-950">Build &gt; Authentication</strong> चुनें।</li>
                            <li>ऊपर <strong className="font-bold text-gray-950">Settings</strong> टैब पर जाएँ।</li>
                            <li>लेफ्ट मेनू में <strong className="font-bold text-[#fb641b]">Authorized Domains (अधिकृत डोमेन)</strong> चुनें।</li>
                            <li><strong className="font-bold text-gray-950">Add Domain</strong> दबाएँ और नीचे दिए दोनों डोमेन जोड़ें:</li>
                          </ol>

                          <div className="space-y-2 bg-white p-1.5 rounded border border-orange-150 font-mono text-[9px] text-gray-600">
                            <div className="p-1 hover:bg-gray-50 flex flex-col gap-0.5">
                              <span className="font-bold text-blue-700 select-all break-all">ais-dev-lzyys7b3akwltoopmp5xzn-906285473239.asia-southeast1.run.app</span>
                            </div>
                            <div className="p-1 hover:bg-gray-50 flex flex-col gap-0.5 border-t border-gray-150">
                              <span className="font-bold text-blue-700 select-all break-all">ais-pre-lzyys7b3akwltoopmp5xzn-906285473239.asia-southeast1.run.app</span>
                            </div>
                          </div>

                          <p className="text-[9.5px] text-orange-900 font-bold bg-orange-100/40 p-1.5 rounded mt-1.5">
                            💡 डोमेन जोड़कर पेज रीफ्रेश (Refresh) करें, फिर दोबारा लॉगिन करें!
                          </p>
                        </div>
                      )}

                      {popupBlocked && (
                        <div className="p-3.5 bg-yellow-50 border border-yellow-200 rounded-lg text-left text-[11px] leading-relaxed text-yellow-950 space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar shadow-sm animate-fade-in">
                          <div className="flex items-center gap-1.5 border-b border-yellow-200 pb-1.5 border-dashed">
                            <AlertCircle className="text-yellow-600 animate-pulse shrink-0" size={14} />
                            <h4 className="font-bold text-[#00081d] text-xs uppercase tracking-tight">🚨 Popup Blocked Solution (हिन्दी):</h4>
                          </div>
                          
                          <p className="font-semibold text-gray-700 font-sans text-[10.5px]">
                            सुरक्षा कारणों से या iframe (AI Studio App Preview Layout) के कारण ब्राउज़र ने Google Login को ब्लॉक कर दिया है।
                          </p>
                          
                          <p className="font-bold text-blue-700 text-[10.5px]">
                            👉 इसे ठीक करने का सबसे आसान तरीका:
                          </p>
                          <ol className="list-decimal list-inside space-y-1.5 text-gray-700 font-medium text-[10.5px]">
                            <li>इस स्क्रीन के ऊपर दाईं ओर दी गई <strong>'Open in a New Tab'</strong> (नए टैब में खोलें) बटन पर क्लिक करके ऐप को नए टैब में खोलें।</li>
                            <li>वहाँ स्वतंत्र पेज पर Google Login बिना किसी रुकावट या पॉपअप ब्लॉक के तुरंत सफल होगा!</li>
                          </ol>
                        </div>
                      )}
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
