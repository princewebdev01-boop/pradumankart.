import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  Plus, 
  Trash2, 
  Edit,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Layers
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product, Section } from '../types';
import { formatINR } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';
import ProductForm from '../components/admin/ProductForm';
import SectionManager from '../components/admin/SectionManager';
import BannerManager from '../components/admin/BannerManager';
import OrderManager from '../components/admin/OrderManager';
import UserManager from '../components/admin/UserManager';
import CouponManager from '../components/admin/CouponManager';
import { Tag } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Real stats
  const [statsData, setStatsData] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    products: 0,
    recentOrders: [] as any[]
  });

  const { logout } = useAuthStore();

  useEffect(() => {
    fetchProducts();
    
    // Real-time stats streams
    const unsubProducts = onSnapshot(collection(db, 'products'), (s) => {
      setStatsData(prev => ({ ...prev, products: s.size }));
    }, (err) => {
      console.warn("Products stats stream error:", err);
    });
    
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (s) => {
      const orders = s.docs.map(d => d.data());
      const totalRevenue = orders.reduce((sum, o: any) => sum + (o.totalAmount || 0), 0);
      setStatsData(prev => ({ 
        ...prev, 
        orders: s.size, 
        revenue: totalRevenue,
        recentOrders: s.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() }))
      }));
    }, (err) => {
      console.warn("Orders stats stream error:", err);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => {
      setStatsData(prev => ({ ...prev, users: s.size }));
    }, (err) => {
      console.warn("Users stats stream error:", err);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
    };
  }, []);

  const stats = [
    { label: 'Total Revenue', value: formatINR(statsData.revenue), icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: statsData.orders, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Products', value: statsData.products, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Users', value: statsData.users || 'N/A', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      setLoading(true);
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          rating: 4.5,
          reviewCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsProductFormOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (e) {
      console.error('Error saving product:', e);
      alert('Failed to save product. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (e) {
        console.error('Error deleting product:', e);
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sections', label: 'Home Rows', icon: Layers },
    { id: 'products', label: 'All Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#f8fafc] overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[110] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen w-72 bg-[#00081d] text-white z-[120] transition-transform duration-300 shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-8 py-10 flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black italic uppercase italic tracking-tighter leading-none">Admin Panel</h1>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">PradumanKart v2.0</span>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-full" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          {/* Nav */}
          <nav className="flex-grow px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold transition-all
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-6 border-t border-white/5 bg-white/5 m-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 text-[#00081d] rounded-full flex items-center justify-center font-black">A</div>
              <div className="flex flex-col">
                <span className="text-sm font-black italic uppercase leading-none">Admin Station</span>
                <span className="text-[10px] font-bold text-gray-500 truncate">System Authority</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={16} /> SIGN OUT
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-[100] px-4 md:px-10 h-20 flex items-center justify-between">
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex-grow px-6 hidden sm:block">
             <div className="max-w-md bg-gray-100 rounded-full flex items-center px-4 h-10">
               <Package size={18} className="text-gray-400 mr-2" />
               <input type="text" placeholder="Search orders, products..." className="bg-transparent text-sm w-full outline-none font-bold" />
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Session</p>
               <p className="text-sm font-black italic text-[#2874f0]">LIVE MODE</p>
             </div>
             <div className="w-10 h-10 bg-[#00081d] rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <span className="text-white text-xs font-black">A</span>
             </div>
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h1 className="text-3xl font-black italic uppercase italic tracking-tighter text-[#00081d]">Overview</h1>
                <p className="text-gray-500 text-sm font-bold uppercase">Real-time statistics for your store</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                        <stat.icon size={28} />
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black uppercase rounded-full tracking-widest">+12%</span>
                    </div>
                    <div className="text-3xl font-black italic text-[#00081d] mb-1 leading-none">{stat.value}</div>
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black italic uppercase italic tracking-tighter text-xl">Recent Sales</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-6">
                    {statsData.recentOrders.length > 0 ? (
                      statsData.recentOrders.map((order, i) => (
                        <div key={order.id} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-black text-blue-600 border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">#O{i+1}</div>
                            <div>
                              <p className="font-black italic text-sm text-[#00081d]">{order.userEmail?.split('@')[0] || 'User'}</p>
                              <p className="text-[10px] font-bold text-gray-400">{order.paymentMethod} • {order.createdAt?.toDate?.()?.toLocaleTimeString() || 'Recent'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-lg text-[#00081d]">{formatINR(order.totalAmount)}</p>
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-full">{order.status}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No Sales Data Available Yet</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black italic uppercase italic tracking-tighter text-xl">Inventory Status</h3>
                    <button onClick={() => setActiveTab('products')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Manage</button>
                  </div>
                  <div className="space-y-6">
                    {products.length > 0 ? (
                      products.slice(0, 5).map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#00081d] text-white rounded-xl overflow-hidden flex items-center justify-center font-black">
                               <img src={p.images[0]} alt="" className="w-full h-full object-cover p-1" />
                            </div>
                            <div>
                              <p className="font-black italic text-sm text-[#00081d] truncate max-w-[120px]">{p.name}</p>
                              <p className="text-[10px] font-bold text-gray-400">Stock: {p.stock} • {p.category}</p>
                            </div>
                          </div>
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full ${p.stock < 10 ? 'bg-red-500' : 'bg-green-600'}`} style={{ width: `${Math.min(100, (p.stock/50)*100)}%` }}></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No Products Added</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sections' && <SectionManager />}
          {activeTab === 'banners' && <BannerManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'coupons' && <CouponManager />}

          {activeTab === 'users' && <UserManager />}

          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black italic uppercase italic tracking-tighter text-[#00081d]">Inventory</h1>
                  <p className="text-gray-500 text-sm font-bold uppercase">Total Products: {products.length}</p>
                </div>
                <button 
                  onClick={() => { setEditingProduct(null); setIsProductFormOpen(true); }}
                  className="bg-[#fb641b] text-white px-8 py-4 rounded-xl font-black shadow-xl italic tracking-tighter flex items-center gap-2 hover:bg-[#e65a15] transition-all active:scale-95 text-lg"
                >
                  <Plus size={24} /> ADD NEW PRODUCT
                </button>
              </header>

              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#00081d] text-white text-[10px] uppercase font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-5">Product</th>
                        <th className="px-6 py-5">Category</th>
                        <th className="px-6 py-5">Price</th>
                        <th className="px-6 py-5">Inventory</th>
                        <th className="px-6 py-5">Row/Section</th>
                        <th className="px-6 py-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden p-2 border border-gray-100 flex-shrink-0">
                                <img src={p.images[0]} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-black italic text-sm text-[#00081d] truncate">{p.name}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase truncate">{p.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black uppercase px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-widest">{p.category}</span>
                          </td>
                          <td className="px-6 py-4">
                             <p className="font-black text-sm">{formatINR(p.price)}</p>
                             {p.discount > 0 && <p className="text-[10px] text-green-600 font-bold">{p.discount}% OFF</p>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                               <div className="flex justify-between items-center w-24">
                                 <span className="text-[10px] font-black uppercase text-gray-400">Stock</span>
                                 <span className={`text-[10px] font-black ${p.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>{p.stock}</span>
                               </div>
                               <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${p.stock < 10 ? 'bg-red-500' : 'bg-green-600'}`} 
                                    style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }} 
                                  />
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black uppercase text-[#2874f0] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                               {p.sectionId ? 'Assigned' : 'Shop Only'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => { setEditingProduct(p); setIsProductFormOpen(true); }}
                                className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              >
                                <Edit size={20} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!['dashboard', 'products', 'sections', 'banners', 'orders', 'users', 'coupons'].includes(activeTab) && (
            <div className="py-40 text-center animate-in zoom-in duration-500">
               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Package size={48} className="text-gray-300" />
               </div>
               <h2 className="text-2xl font-black italic uppercase italic tracking-tighter text-[#00081d]">Module Coming Soon</h2>
               <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2">{activeTab} management is being optimized</p>
            </div>
          )}
        </div>
      </main>

      {/* Product Form Modal */}
      {isProductFormOpen && (
        <ProductForm 
          product={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => { setIsProductFormOpen(false); setEditingProduct(null); }} 
        />
      )}
    </div>
  );
}
