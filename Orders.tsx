import { useState, useEffect } from 'react';
import { CATEGORIES, PRODUCTS as MOCK_PRODUCTS, BANNERS } from '../constants';
import ProductCard from '../components/common/ProductCard';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Section, Banner } from '../types';

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [dbBanners, setDbBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch banners
        const bannersQ = query(collection(db, 'banners'), orderBy('order', 'asc'));
        const bannersSnap = await getDocs(bannersQ);
        const bannersData = bannersSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Banner))
          .filter(b => b.active !== false); // Default to active if missing
        setDbBanners(bannersData);

        // Fetch sections
        const sectionsQ = query(collection(db, 'sections'), orderBy('order', 'asc'));
        const sectionsSnap = await getDocs(sectionsQ);
        const sectionsData = sectionsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Section))
          .filter(s => s.active !== false); // Default to active if missing
        
        // Fetch products
        const productsSnap = await getDocs(collection(db, 'products'));
        const productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        setSections(sectionsData);
        setProducts(productsData);
      } catch (e) {
        console.error('Error fetching home data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const bannerCount = dbBanners.length > 0 ? dbBanners.length : BANNERS.length;

  useEffect(() => {
    if (bannerCount === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerCount]);

  const getProductsForSection = (sectionId: string) => {
    return products.filter(p => p.sectionId === sectionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-[#2874f0] italic">Loading PradumanKart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-[#f1f3f6]">
      {/* Category Strip */}
      <div className="bg-white shadow-sm mb-4 overflow-x-auto border-b border-gray-100 no-scrollbar">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 min-w-[800px] md:min-w-0">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/shop?category=${cat.name}`}
              className="flex flex-col items-center gap-1 group cursor-pointer flex-shrink-0 px-4"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center p-2">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <span className="text-[12px] font-bold text-[#212121] group-hover:text-blue-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Banner Carousel */}
      <div className="max-w-[1440px] mx-auto px-0 md:px-4 mb-6">
        <div className="relative group overflow-hidden md:rounded-lg shadow-sm">
          <div className="relative h-[200px] sm:h-[280px] md:h-[380px] bg-gradient-to-r from-[#0055ff] to-[#00aaff] overflow-hidden">
            <AnimatePresence mode="wait">
              {dbBanners.length > 0 ? (
                <motion.div
                  key={dbBanners[currentBanner].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={dbBanners[currentBanner].image} 
                    alt={dbBanners[currentBanner].title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center px-8 md:px-20">
                    <div className="relative z-10 space-y-4 max-w-lg text-white">
                      <div className="flex flex-col">
                        <span className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">{dbBanners[currentBanner].title}</span>
                        {dbBanners[currentBanner].subtitle && (
                          <span className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none text-yellow-400">{dbBanners[currentBanner].subtitle}</span>
                        )}
                      </div>
                      <Link to={dbBanners[currentBanner].link} className="inline-block bg-white text-[#00081d] px-8 py-3 rounded-sm font-black text-sm uppercase tracking-widest hover:bg-yellow-400 transition-colors shadow-xl">
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center px-8 md:px-20">
                  <div className="relative z-10 space-y-4 max-w-lg">
                    <div className="flex flex-col text-white">
                      <span className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">PRADUMANKART</span>
                      <span className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">SALE IS LIVE!</span>
                    </div>
                    <p className="text-white/90 text-sm md:text-xl font-bold max-w-sm leading-tight uppercase tracking-tight">
                      Best Deals on Mobiles, Electronics, Fashion & more
                    </p>
                    <Link to="/shop" className="inline-block bg-yellow-400 text-[#00081d] px-8 py-3 rounded-sm font-black text-sm uppercase tracking-widest hover:bg-yellow-500 transition-colors shadow-xl">
                      Shop Now
                    </Link>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:flex items-center justify-center pointer-events-none">
                    <img 
                      src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600&h=400" 
                      className="w-full h-full object-cover"
                      alt="Banner Default"
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <button 
              onClick={() => setCurrentBanner((prev) => (prev - 1 + bannerCount) % bannerCount)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-r-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20"
            >
              <ChevronLeft size={24} className="text-[#00081d]" />
            </button>
            <button 
              onClick={() => setCurrentBanner((prev) => (prev + 1) % bannerCount)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-l-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-20"
            >
              <ChevronRight size={24} className="text-[#00081d]" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          if (section.type === 'products') {
            const sectionProducts = getProductsForSection(section.id);
            if (sectionProducts.length === 0) return null;

            return (
              <section key={section.id} className="bg-white max-w-7xl mx-auto shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#00081d]">{section.title}</h2>
                      {section.subtitle && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{section.subtitle}</p>}
                    </div>
                  </div>
                  <Link to={`/shop?section=${section.id}`} className="bg-[#2874f0] text-white px-5 py-2 rounded-sm text-xs font-black uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all">View All</Link>
                </div>
                
                <div className="p-4 overflow-x-auto no-scrollbar scroll-smooth">
                  <div className="flex gap-4 pb-2">
                    {sectionProducts.map(p => (
                      <div key={p.id} className="w-[180px] md:w-[220px] flex-shrink-0">
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (section.type === 'banner' && section.config?.imageUrl) {
            return (
              <div key={section.id} className="max-w-7xl mx-auto px-0 md:px-4">
                <Link to={section.config?.link || '/shop'} className="block relative h-[120px] md:h-[200px] overflow-hidden md:rounded-lg shadow-sm border border-gray-100">
                  <img 
                    src={section.config.imageUrl} 
                    alt={section.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                </Link>
              </div>
            );
          }

          return null;
        })}

        {/* Fallback if no sections in Firestore */}
        {sections.length === 0 && !loading && (
           <div className="p-20 text-center space-y-4">
              <div className="w-24 h-24 bg-white shadow-2xl rounded-3xl flex items-center justify-center mx-auto text-[#2874f0]">
                <Sparkles size={48} />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#00081d]">Welcome to {(import.meta as any).env?.VITE_APP_NAME || 'PradumanKart'}</h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto leading-relaxed">Discover premium deals and top-tier products curated just for you. Explore our full collection below.</p>
              <Link to="/shop" className="inline-block bg-[#2874f0] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 transition-transform">Explore Shop</Link>
           </div>
        )}
      </div>

      {/* Featured Banner (Dynamic or Fallback) */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-8">
         <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[200px] md:h-[300px]">
           <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1600&h=400" alt="Sponsor" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 md:p-12">
              <div className="text-white space-y-2">
                 <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">Premium Gaming Gears</h3>
                 <p className="text-sm md:text-lg font-bold text-gray-200">Up to 40% Off on Top Brands</p>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}
