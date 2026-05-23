import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { activeFirebaseConfig, isUsingLocalConfig } from '../lib/firebase';
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
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

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
    setPopupBlocked(false);
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Google login failed or access denied');
      }
    } catch (e: any) {
      console.error('Google Login Error:', e);
      const isPopupError = e.code === 'auth/popup-blocked' || 
                           e.code === 'auth/cancelled-popup-request' || 
                           (e.message && (e.message.includes('popup-blocked') || e.message.includes('cancelled-popup-request')));
      
      if (e.code === 'auth/operation-not-allowed') {
        setError('Google Login is not enabled in Firebase. Please enable it in your Console.');
        setShowProviderInfo(true);
      } else if (isPopupError) {
        setError('Google Login Popup Error: The popup was either blocked by your browser or cancelled.');
        setPopupBlocked(true);
      } else if (e.code === 'auth/unauthorized-domain' || (e.message && e.message.includes('unauthorized-domain'))) {
        setError('Google Login Error: Firebase has blocked this domain as Unauthorized. Please add this domain in Firebase Console.');
        setUnauthorizedDomain(true);
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
                <div className="w-full">
                  <p className="text-red-700 text-xs font-bold uppercase tracking-tight">{error}</p>
                  
                  <div className="mt-4 pt-4 border-t border-red-100 text-[10px] text-gray-600 space-y-3">
                    <p className="font-black uppercase tracking-widest text-[8px] text-gray-500">Firebase App Diagnostics Panel:</p>
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-700">
                        Active Database Project: <code className="bg-red-100 border border-red-200 px-1 py-0.5 rounded text-[11px] text-[#00081d] font-mono font-black">{activeFirebaseConfig.projectId}</code>
                      </p>
                      <p className="text-[9px] text-gray-400">
                        (Connected to: <code className="font-mono bg-gray-150 px-1 rounded text-blue-800 font-bold">{activeFirebaseConfig.projectId}</code>)
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-red-100 space-y-2 shadow-sm">
                      <p className="font-bold text-gray-700 uppercase tracking-wider text-[8px]">Configuration Source Status:</p>
                      
                      <div className="grid grid-cols-1 gap-1.5 font-mono text-[9px]">
                        <div className="flex items-center justify-between py-0.5 border-b border-gray-50">
                          <span className="text-gray-500">API Key Source</span>
                          {import.meta.env.VITE_FIREBASE_API_KEY ? (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">✅ Vercel Env Var</span>
                          ) : (
                            <span className="text-blue-600 font-bold bg-blue-50 px-1.5 rounded">ℹ️ Applet Config File</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between py-0.5 border-b border-gray-50">
                          <span className="text-gray-500">API Key Value</span>
                          <span className="text-[#00081d] font-mono font-medium truncate max-w-[150px]">{activeFirebaseConfig.apiKey || 'undefined'}</span>
                        </div>
                        <div className="flex items-center justify-between py-0.5 border-b border-gray-50">
                          <span className="text-gray-500">Project Connection</span>
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">✅ Connected</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900 leading-relaxed">
                      <span className="text-xs font-bold uppercase tracking-wide block">💡 STATUS CONTEXT:</span>
                      <p className="mt-1 font-medium text-[9.5px]">Your app automatically connects to the designated active project: <strong className="font-black text-blue-950 underline font-mono">{activeFirebaseConfig.projectId}</strong>. If deploying to Vercel, satisfy all environment variables in your Vercel Project Settings to route to your custom db!</p>
                      <p className="mt-1.5 text-[9px] font-semibold text-blue-950">
                        Since Email/Password provider is active on your console screen, please double check that you are logging in with a user that exists in the <strong>Authentication &gt; Users</strong> tab of your custom console, or register a new one.
                      </p>
                    </div>
                  </div>

                  {showProviderInfo && (
                    <div className="mt-3 p-3 bg-white/50 rounded-xl border border-red-100 text-[10px] leading-relaxed text-red-600">
                      To fix this error: Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold">Firebase Console</a> &gt; Build &gt; Authentication &gt; Settings &gt; Sign-in method and enable the requested provider.
                    </div>
                  )}

                  {unauthorizedDomain && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-left text-xs leading-relaxed text-orange-900 space-y-3 shadow-md">
                      <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                        <Sparkles className="text-orange-500 animate-pulse" size={18} />
                        <h4 className="font-black text-[#00081d] text-sm uppercase tracking-tight">🚨 Google Login Error (unauthorized-domain) का हल:</h4>
                      </div>
                      <p className="font-semibold text-gray-700 text-[11px]">
                        यह एरर इसलिए आ रहा है क्योंकि आपका यह Development Domain आपके Firebase Console प्रोजेक्ट में <strong className="font-extrabold text-[#fb641b]">Authorized Domains (अधिकृत डोमेन)</strong> की लिस्ट में जुड़ा हुआ नहीं है।
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-orange-150 space-y-2">
                        <p className="font-black text-[#00081d] uppercase text-[10px] tracking-wider">इसे ठीक करने के लिए नीचे दिए गए स्टेप्स को पूरा करें:</p>
                        <ol className="list-decimal list-inside space-y-1.5 text-gray-700 font-medium pl-1 text-[11px]">
                          <li>अपने <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-extrabold">Firebase Console</a> पर जाएँ।</li>
                          <li>अपने प्रोजेक्ट <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono font-black">{activeFirebaseConfig.projectId}</code> को सेलेक्ट करें।</li>
                          <li>लेफ्ट साइडबार में देखें: <strong className="font-bold text-gray-900">Build &gt; Authentication</strong> पर क्लिक करें।</li>
                          <li>ऊपर की ओर <strong className="font-bold text-gray-900">Settings</strong> टैब पर जाएँ।</li>
                          <li>बाईं ओर दी गई लिस्ट में से <strong className="font-bold text-[#fb641b]">Authorized Domains (अधिकृत डोमेन)</strong> को चुनें।</li>
                          <li><strong className="font-bold text-gray-900">Add Domain</strong> बटन पर क्लिक करें।</li>
                          <li>नीचे दिए गए डोमेन नेम को एक-एक करके (बिना <code className="text-gray-400 font-normal">https://</code> के) पेस्ट करें और जोड़ें (Add):</li>
                        </ol>
                        <div className="mt-3 space-y-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-mono text-[10px] text-gray-600">
                          <div className="flex items-center justify-between gap-2 p-1.5 bg-white border border-gray-150 rounded">
                            <span className="font-bold select-all text-blue-700 break-all">ais-dev-lzyys7b3akwltoopmp5xzn-906285473239.asia-southeast1.run.app</span>
                            <span className="text-[9px] text-gray-400 uppercase font-sans font-bold shrink-0">Development</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 p-1.5 bg-white border border-gray-150 rounded">
                            <span className="font-bold select-all text-blue-700 break-all">ais-pre-lzyys7b3akwltoopmp5xzn-906285473239.asia-southeast1.run.app</span>
                            <span className="text-[9px] text-gray-400 uppercase font-sans font-bold shrink-0">Preview</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-orange-800 font-bold bg-orange-100/50 p-2 rounded-lg">
                        💡 <strong>ध्यान दें:</strong> डोमेन जोड़ने के बाद इस पेज को एक बार रीफ्रेश (Refresh) करें और पुनः Google Login करें। आपका लॉगिन सफलतापूर्वक काम करेगा!
                      </p>
                    </div>
                  )}

                  {popupBlocked && (
                    <div className="mt-4 p-4 bg-yellow-50/95 border border-yellow-200 rounded-xl text-left text-xs leading-relaxed text-yellow-950 space-y-3 shadow-md animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-yellow-200 pb-2 border-dashed">
                        <AlertCircle className="text-yellow-600 animate-pulse shrink-0" size={18} />
                        <h4 className="font-black text-[#00081d] text-sm uppercase tracking-tight">🚨 Google Login Popup Blocked / Warning (पॉपअप समस्या का हल):</h4>
                      </div>
                      <p className="font-bold text-gray-700 text-[11px]">
                        यह एरर सामान्यतः तब आता है जब आपका ब्राउज़र सुरक्षा कारणों से या iframe (AI Studio UI Embedded) के अंदर होने के कारण नए Google Login पॉपअप को ब्लॉक कर देता है, या पॉपअप पूरी तरह से लोड होने से पहले बंद हो जाता है।
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-yellow-150 space-y-2">
                        <p className="font-black text-[#00081d] uppercase text-[9px] tracking-wider">इसे 1 सेकंड में ठीक करने के आसान तरीके:</p>
                        <ol className="list-decimal list-inside space-y-1.5 text-gray-700 font-medium pl-1 text-[11px]">
                          <li>
                            <strong className="text-blue-700">सबसे आसान समाधान:</strong> इस पेज के ऊपर दायें कोने (Top-Right) में दिए गए <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">Open in a New Tab</code> (नए टैब में खोलें) आइकॉन पर क्लिक करें।
                          </li>
                          <li>
                            ऐप नए टैब में स्वतंत्र रूप से खुल जाने के बाद, दोबारा <strong>Google Login</strong> पर क्लिक करें। यह बिना किसी एरर के तुरंत काम करेगा।
                          </li>
                          <li>
                            वैकल्पिक रूप से, अपने ब्राउज़र के एड्रेस-बार (Address bar) के दाएं कोने में देखें और <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600 font-bold tracking-tight">"Always allow popups on this site"</code> (पॉपअप की अनुमति दें) पर क्लिक करें।
                          </li>
                        </ol>
                      </div>
                      <p className="text-[10.5px] text-yellow-900 font-bold bg-yellow-105 p-2 rounded-lg">
                        💡 <strong>महत्वपूर्ण सुझाव:</strong> हमेशा AI Studio Previews में Authentications का उपयोग करते समय ऐप को स्वतंत्र रूप से नए टैब में खोलना सबसे सुरक्षित और सुलभ तरीका है।
                      </p>
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
