import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Run both checks: Firestore role and Server JWT
        await syncUserToFirestore(user);
        
        try {
          const res = await fetch('/api/admin/check');
          if (res.ok) {
            const data = await res.json();
            if (data.isAdmin) setIsAdmin(true);
          }
        } catch (e) {
          console.error('Server admin check failed:', e);
        }
      } else {
        setIsAdmin(false);
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
            <Route path="/admin-login-private" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/secure-admin-dashboard/*" 
              element={isAdmin ? <Admin /> : <Navigate to="/admin-login-private" />} 
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
