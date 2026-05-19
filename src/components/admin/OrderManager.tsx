import { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ShoppingBag, ChevronDown, CheckCircle, Truck, Package, Clock, XCircle, Search, Filter, ShieldCheck, AlertCircle, Copy, BarChart3, TrendingUp, History, Eye, CheckCircle2, MapPin, Camera } from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_OPTIONS = [
  'Processing',
  'Payment Verification Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export default function OrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showScreenshot, setShowScreenshot] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Analytics Calculation
  const stats = {
    totalRevenue: orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Payment Verification Pending').reduce((acc, o) => acc + (o.totalAmount || 0), 0),
    pendingVerification: orders.filter(o => o.status === 'Payment Verification Pending').length,
    todayOrders: orders.filter(o => {
        const date = o.createdAt?.toDate?.();
        return date && date.toDateString() === new Date().toDateString();
    }).length,
    successRate: (orders.filter(o => o.status === 'Delivered').length / (orders.filter(o => o.status !== 'Cancelled').length || 1) * 100).toFixed(0)
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus, 
        updatedAt: serverTimestamp() 
      });
    } catch (e) {
      console.error('Error updating status:', e);
      alert('Failed to update status');
    }
  };

  const approvePayment = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Confirmed',
        'paymentDetails.status': 'verified',
        updatedAt: serverTimestamp()
      });
      alert('Payment Verified: Order Confirmed');
    } catch (e) {
      console.error('Error approving payment:', e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50 border-green-100';
      case 'Confirmed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Out for Delivery': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Payment Verification Pending': return 'text-orange-600 bg-orange-50 border-orange-100 ring-2 ring-orange-200 animate-pulse';
      case 'Processing': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.phone?.includes(searchTerm) ||
      order.paymentDetails?.utr?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Financial Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Financial Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
               <TrendingUp size={64} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aggregate Revenue</p>
            <h4 className="text-3xl font-black italic text-[#00081d] uppercase tracking-tighter">{formatINR(stats.totalRevenue)}</h4>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase">
               <TrendingUp size={12} /> Live Processing
            </div>
         </div>
         <div className="bg-[#00081d] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest mb-2">Verification Queue</p>
            <h4 className="text-3xl font-black italic text-white uppercase tracking-tighter">{stats.pendingVerification} Orders</h4>
            <div className="mt-4 flex items-center gap-2 text-orange-400 font-black text-[10px] uppercase">
               <Clock size={12} className="animate-pulse" /> Security Clearance Required
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Daily Flow</p>
            <h4 className="text-3xl font-black italic text-[#00081d] uppercase tracking-tighter">{stats.todayOrders} Initialized</h4>
            <div className="mt-4 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase">
               <History size={12} /> Last 24 Hours
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Logistics Integrity</p>
            <h4 className="text-3xl font-black italic text-[#00081d] uppercase tracking-tighter">{stats.successRate}% Success</h4>
            <div className="mt-4 flex items-center gap-2 text-purple-600 font-black text-[10px] uppercase">
               <BarChart3 size={12} /> Fulfilment Ratio
            </div>
         </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pt-4">
        <div>
           <h2 className="text-5xl font-black italic uppercase tracking-tighter text-[#00081d]">Transaction Vault</h2>
           <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">Deep Intelligence Ledger — {filteredOrders.length} records</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {['All', 'Payment Verification Pending', 'Confirmed', 'Shipped', 'Delivered'].map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-[#00081d] text-white shadow-xl shadow-blue-500/10 scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:border-blue-600'}`}
              >
                {s === 'Payment Verification Pending' ? 'Verification' : s}
              </button>
           ))}
        </div>
      </div>

      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
         <input 
           type="text" 
           placeholder="Search Protocol ID, End-User, Mobile, or Transaction Hash (UTR)..."
           className="w-full bg-white border-2 border-gray-100 rounded-[2rem] py-6 pl-16 pr-8 font-black text-sm outline-none focus:border-blue-600 focus:shadow-2xl focus:shadow-blue-500/5 transition-all placeholder:text-gray-300"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className={`bg-white border rounded-[3rem] overflow-hidden transition-all duration-500 ${expandedId === order.id ? 'border-blue-600 shadow-2xl scale-[1.01]' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
            <div 
              className="p-10 flex flex-wrap items-center justify-between gap-10 cursor-pointer select-none"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black transition-transform duration-500 ${expandedId === order.id ? 'rotate-[360deg]' : ''} ${order.paymentMethod === 'UPI' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-orange-500 text-white shadow-lg shadow-orange-600/20'}`}>
                   {order.paymentMethod === 'UPI' ? <CheckCircle size={32} /> : <ShoppingBag size={32} />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                     <h3 className="font-black italic text-xl text-[#00081d] uppercase tracking-tighter">
                        {order.orderId || `PK-${order.id.slice(-8).toUpperCase()}`}
                     </h3>
                     {order.paymentMethod === 'UPI' && (
                        <span className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic">Digital Transfer</span>
                     )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                     <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                        <Clock size={10} className="text-gray-400" />
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{order.createdAt?.toDate?.()?.toLocaleString() || 'Recent'}</p>
                     </div>
                     <span className="w-1 h-1 bg-gray-200 rounded-full" />
                     <p className="text-[9px] font-black text-[#00081d] uppercase tracking-widest">{order.userEmail}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-12">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Net Value</p>
                  <p className="font-black text-2xl text-[#00081d]">{formatINR(order.totalAmount)}</p>
                </div>
                <div className={`px-6 py-3 border-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <ChevronDown className={`transition-transform duration-700 ${expandedId === order.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === order.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-12 pb-12 pt-4 border-t border-gray-50 bg-gray-50/10"
                >
                  {/* Digital Asset Verification */}
                  {order.status === 'Payment Verification Pending' && (
                    <div className="mb-12 p-8 bg-white border-2 border-orange-100 rounded-[3rem] shadow-xl shadow-orange-500/5 flex flex-col md:flex-row items-center justify-between gap-10">
                       <div className="flex items-center gap-8">
                          <div className="relative group/shot">
                             <div 
                               onClick={() => setShowScreenshot(order.paymentDetails?.screenshot)}
                               className="w-24 h-24 bg-gray-100 rounded-[1.5rem] flex items-center justify-center text-gray-300 overflow-hidden cursor-pointer border-2 border-dashed border-gray-200 hover:border-blue-500 transition-all"
                             >
                                {order.paymentDetails?.screenshot ? (
                                   <img src={order.paymentDetails.screenshot} className="w-full h-full object-cover group-hover/shot:scale-110 transition-transform" />
                                ) : (
                                   <Camera size={32} />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/shot:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">
                                   <Eye size={16} />
                                </div>
                             </div>
                          </div>
                          <div>
                             <h4 className="font-black italic text-[#00081d] text-lg uppercase tracking-tight">Security Clearance Required</h4>
                             <div className="flex items-center gap-3 mt-1">
                                <p className="text-[11px] font-bold text-gray-500">Hash (UTR): <span className="font-black text-blue-600 underline select-all">{order.paymentDetails?.utr || 'NOT_PROVIDED'}</span></p>
                                <button onClick={() => { navigator.clipboard.writeText(order.paymentDetails?.utr || ''); alert('UTR COPIED'); }} className="text-blue-600 hover:scale-110 transition-transform">
                                   <Copy size={14} />
                                </button>
                             </div>
                             <div className="mt-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Manual override active</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                approvePayment(order.id);
                            }}
                            className="bg-[#00081d] text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group"
                          >
                             <CheckCircle2 size={16} className="group-hover:scale-125 transition-transform" /> Authorize Transaction
                          </button>
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(order.id, 'Cancelled');
                            }}
                            className="bg-white border-2 border-red-50 text-red-500 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all"
                          >
                             Purge Request
                          </button>
                       </div>
                    </div>
                  )}

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                      {/* Products Inventory */}
                      <div className="lg:col-span-2 space-y-8">
                         <div className="flex items-center justify-between border-b-2 border-gray-50 pb-4">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2">
                              <Package size={14} /> Intelligence Inventory
                            </h4>
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest translate-y-1">{order.items?.length || 0} Units Manifested</span>
                         </div>
                         <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden divide-y divide-gray-50 shadow-sm">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="p-8 flex items-center gap-8 group hover:bg-gray-50/50 transition-colors">
                                 <div className="w-24 h-24 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform duration-500">
                                    <img src={item.image} className="max-h-full max-w-full object-contain mix-blend-multiply" alt="" />
                                 </div>
                                 <div className="flex-grow space-y-2">
                                    <p className="font-black italic text-base text-[#00081d] uppercase tracking-tighter line-clamp-1">{item.name}</p>
                                    <div className="flex items-center gap-4">
                                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">Quantified: {item.quantity}</span>
                                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">{formatINR(item.price)} per unit</span>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-300 uppercase italic mb-1">Subtotal</p>
                                    <p className="font-black text-lg text-[#00081d] italic">{formatINR(item.price * item.quantity)}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Control Panel & Logistics */}
                      <div className="space-y-12">
                         <div>
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6 flex items-center gap-2">
                              <MapPin size={14} /> Recipient Vector
                            </h4>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 text-xs font-bold text-gray-500 leading-relaxed shadow-sm space-y-4">
                               <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                                  <p className="text-[#00081d] font-black italic uppercase text-lg tracking-tighter">{order.address?.name}</p>
                                  <button onClick={() => navigator.clipboard.writeText(`${order.address?.name}\n${order.address?.phone}\n${order.address?.address}, ${order.address?.city}`)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                     <Copy size={16} />
                                  </button>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-gray-900 font-black uppercase text-[10px]">{order.address?.address}</p>
                                  <p>{order.address?.locality}</p>
                                  <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                               </div>
                               <div className="pt-4 flex items-center gap-4">
                                  <a href={`tel:${order.address?.phone}`} className="flex-grow bg-[#00081d] text-white px-6 py-4 rounded-2xl font-black text-center text-[10px] uppercase tracking-widest border border-blue-900 shadow-xl shadow-blue-900/20">
                                     SECURE CONTACT: {order.address?.phone}
                                  </a>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2">
                              <BarChart3 size={14} /> Deployment Control
                            </h4>
                            <div className="grid grid-cols-1 gap-2 p-3 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
                               {STATUS_OPTIONS.map(status => (
                                 <button 
                                   key={status}
                                   onClick={(e) => {
                                       e.stopPropagation();
                                       updateStatus(order.id, status);
                                   }}
                                   className={`w-full px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group/btn ${
                                     order.status === status ? 'bg-[#00081d] text-white shadow-xl translate-x-1' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50/50'
                                   }`}
                                 >
                                    {status}
                                    {order.status === status && <CheckCircle size={14} className="text-blue-400" />}
                                    {order.status !== status && <ChevronDown size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Screenshot Modal Viewer */}
      <AnimatePresence>
         {showScreenshot && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowScreenshot(null)}
               className="fixed inset-0 z-[999] bg-[#00081d]/95 backdrop-blur-2xl p-10 flex items-center justify-center cursor-zoom-out"
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white p-4 rounded-[4rem] shadow-2xl relative max-w-2xl w-full border-8 border-white/10"
               >
                  <img src={showScreenshot} className="w-full h-auto rounded-[3rem] object-contain shadow-2xl" />
                  <button 
                    onClick={() => setShowScreenshot(null)}
                    className="absolute top-8 right-8 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-2xl hover:scale-110 transition-transform"
                  >
                     <XCircle size={32} />
                  </button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {filteredOrders.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100 shadow-sm">
           <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
              <ShoppingBag size={56} />
           </div>
           <p className="text-[#00081d] font-black italic uppercase tracking-tighter text-2xl">Vault Protocol: No Matching Records</p>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-3">Reset filters or check system connection</p>
        </div>
      )}
    </div>
  );
}
