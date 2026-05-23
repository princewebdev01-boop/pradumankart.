import { useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import BackButton from './components/layout/BackButton';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminLoginPrivate from './pages/AdminLoginPrivate';
import Cart from './pages/Cart';
import Shop from './pages/Shop';
import Wishlist from './pages/Wishlist';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Signup from './pages/Signup';
import { seedDatabase } from './lib/seed';

// Placeholder pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4 bg-white m-4 rounded-xl shadow-sm border border-gray-100">
    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
       <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <h2 className="text-3xl font-black text-[#00081d] italic uppercase tracking-tighter mb-2">{title}</h2>
    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Coming soon to PradumanKart</p>
  </div>
);

const Profile = () => <PlaceholderPage title="Profile" />;

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAdmin = useAuthStore((state) => state.setIsAdmin);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const syncUserToFirestore = useAuthStore((state) => state.syncUserToFirestore);

  useEffect(() => {
    // Seed database if needed (optional check)
    // seedDatabase();
  }, []);

  useEffect(() => {
    // 0. Handle Google Sign-In redirect result on mount
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          console.log('Google redirect login success, syncing user:', result.user);
          await syncUserToFirestore(result.user, 'google');
          setUser(result.user);
        }
      })
      .catch((error: any) => {
        console.error('Error handling Google Sign-In redirect:', error);
      });

    // 1. Initial local state check for admin session persistence (vital for clean reloads and Vercel hosting)
    const savedAdminSession = localStorage.getItem('admin_session');
    if (savedAdminSession === 'true') {
      setIsAdmin(true);
    }

    // 2. Perform background check on server admin cookie if possible
    fetch('/api/admin/check')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Server admin check negative or unauthorized');
      })
      .then((data) => {
        if (data.isAdmin) {
          setIsAdmin(true);
          localStorage.setItem('admin_session', 'true');
        }
      })
      .catch((e) => {
        console.warn('Background server admin token check inactive or not logged in:', e.message);
        // Do not automatically reset isAdmin to false here if we have a valid local storage admin session
        if (savedAdminSession !== 'true') {
          setIsAdmin(false);
        }
      });

    // 3. Monitor Firebase Authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Run both checks: Firestore role and Server JWT
        await syncUserToFirestore(user);
        
        // If they are logged in with the admin email, elevate them
        const adminEmails = [
          'praduman589@gmail.com',
          'admin@pradumankart.com',
          'princemahto131@gmail.com',
          'princewebdev01@gmail.com'
        ];
        if (adminEmails.includes(user.email || '')) {
          setIsAdmin(true);
          localStorage.setItem('admin_session', 'true');
        }
      } else {
        // Only clear admin state if there is also no local storage admin session
        if (localStorage.getItem('admin_session') !== 'true') {
          setIsAdmin(false);
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, setIsAdmin]);

  return (
    <Router>
      <div className="min-h-screen bg-[#f1f3f6] font-sans flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login-private" element={<AdminLoginPrivate />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/admin/*" 
              element={isAdmin ? <Admin /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/admin-dashboard/*" 
              element={isAdmin ? <Admin /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/secure-admin-dashboard/*" 
              element={isAdmin ? <Admin /> : <Navigate to="/" replace />} 
            />
          </Routes>
        </main>
        
        <Footer />
        <BottomNav />
        <BackButton />
      </div>
    </Router>
  );
}
