import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Package, 
  ChevronRight, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  CreditCard,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentDetails?: {
    utr?: string;
    status?: string;
  };
  createdAt: any;
  address: any;
  estimatedDelivery?: any;
}

const TRACKING_STAGES = [
  'Processing',
  'Payment Verification Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

export default function Orders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Order));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Cancelled',
        updatedAt: serverTimestamp()
      });
      alert('Order cancelled successfully');
    } catch (e) {
      console.error('Cancellation error:', e);
      alert('Failed to cancel order. Only processing orders can be cancelled.');
    }
  };

  const getStageIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    // Payment Verification Pending is a branch of Processing for UPI
    if (status === 'Payment Verification Pending') return 1;
    const idx = TRACKING_STAGES.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl animate-spin border-4 border-white shadow-xl" />
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse text-gray-400">Loading your orders</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
           <ShieldCheck size={48} />
        </div>
        <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tight text-[#00081d]">Secure Access Required</h2>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-8">Please login to view and track your orders.</p>
        <Link to="/login" className="bg-[#2874f0] text-white px-12 py-4 font-black uppercase rounded-xl shadow-2xl hover:bg-blue-700 transition-all">Login Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#00081d] italic uppercase tracking-tighter flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                 <Package className="text-white" size={28} />
              </div>
              My Orders
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 ml-1">Managing {orders.length} shipments</p>
          </div>
          <Link to="/shop" className="bg-white border-2 border-gray-100 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"> Continue Shopping </Link>
       </div>

      {orders.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative group">
           <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           <div className="relative z-10">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Clock size={48} className="text-blue-300" />
              </div>
              <h2 className="text-2xl font-black text-[#00081d] uppercase italic tracking-tighter">Your cart history is empty</h2>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-4 mb-10 max-w-sm mx-auto">Start your premium shopping journey today and experience the best of tech and fashion.</p>
              <Link to="/shop" className="bg-[#fb641b] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-orange-200 hover:scale-105 transition-transform block w-fit mx-auto">Browse Collection</Link>
           </div>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const stageIdx = getStageIndex(order.status);
            const isCancelled = order.status === 'Cancelled';
            const canCancel = order.status === 'Processing' || order.status === 'Payment Verification Pending';
            
            return (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-3xl shadow-sm border ${selectedOrderId === order.id ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200'} transition-all overflow-hidden`}
              >
                {/* Header Information */}
                <div 
                  className="p-6 bg-gray-50/50 cursor-pointer flex flex-wrap justify-between items-center gap-6"
                  onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                >
                  <div className="flex gap-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</span>
                      <span className="text-xs font-black italic text-[#00081d]">{order.orderId || `#${order.id.slice(-8).toUpperCase()}`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Placed On</span>
                      <span className="text-xs font-bold">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Method</span>
                      <span className={`text-xs font-black uppercase italic ${order.paymentMethod === 'UPI' ? 'text-[#2874f0]' : 'text-orange-600'}`}>
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Total Amount</span>
                      <span className="text-lg font-black text-[#00081d]">{formatINR(order.totalAmount)}</span>
                    </div>
                    <ChevronDown className={`text-gray-400 transition-transform duration-300 ${selectedOrderId === order.id ? 'rotate-180 text-blue-600' : ''}`} />
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                {!isCancelled && (
                  <div className="px-8 py-10 bg-white overflow-x-auto no-scrollbar">
                    {order.status === 'Payment Verification Pending' && (
                       <div className="mb-10 p-6 bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-orange-500 shadow-sm">
                             <Clock className="animate-spin-slow" size={20} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-[#00081d]">Status: Payment Verification Pending</p>
                             <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest mt-1">Our team is verifying your UTR: {order.paymentDetails?.utr}. This usually takes 15-30 mins.</p>
                          </div>
                       </div>
                    )}
                    <div className="min-w-[600px] relative">
                        {/* Timeline Track */}
                        <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(stageIdx / (TRACKING_STAGES.length - 1)) * 100}%` }}
                             className="h-full bg-blue-600 shadow-sm"
                           />
                        </div>

                        {/* Nodes */}
                        <div className="relative flex justify-between">
                           {TRACKING_STAGES.map((stage, i) => {
                             const active = i <= stageIdx;
                             const current = i === stageIdx;
                             return (
                               <div key={stage} className="flex flex-col items-center text-center w-24">
                                  <div className={`w-8 h-8 rounded-full border-4 ${active ? 'bg-blue-600 border-blue-100' : 'bg-white border-gray-100'} flex items-center justify-center transition-all duration-500 z-10`}>
                                     {active && <CheckCircle2 size={12} className="text-white" />}
                                  </div>
                                  <span className={`mt-3 text-[9px] font-black uppercase tracking-tighter leading-tight ${current ? 'text-blue-600' : active ? 'text-[#00081d]' : 'text-gray-300'}`}>
                                    {stage}
                                  </span>
                               </div>
                             );
                           })}
                        </div>
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div className="p-8 bg-red-50 flex items-center gap-6">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                        <XCircle size={28} />
                     </div>
                     <div>
                        <h4 className="font-black italic text-red-700 uppercase tracking-tight">Order Cancelled</h4>
                        <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest">This order was cancelled and will not be processed further.</p>
                     </div>
                  </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedOrderId === order.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-50 overflow-hidden"
                    >
                      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Order Items */}
                        <div className="lg:col-span-2 space-y-6">
                           <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                             <FileText size={14} /> Item Details
                           </h4>
                           <div className="space-y-4">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex gap-6 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
                                  <div className="w-24 h-24 bg-white rounded-2xl border border-gray-100 p-3 group-hover:shadow-md transition-all">
                                     <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                  </div>
                                  <div className="flex-grow">
                                     <Link to={`/shop`} className="font-black italic text-[#00081d] uppercase text-sm hover:text-blue-600 transition-colors line-clamp-1">{item.name}</Link>
                                     <p className="text-[10px] font-bold text-gray-400 mt-1">QTY: {item.quantity} • {formatINR(item.price)} each</p>
                                     <div className="mt-4 flex items-center gap-4">
                                        <p className="font-black text-[#00081d]">{formatINR(item.price * item.quantity)}</p>
                                        <span className="text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-2 py-1 rounded-sm">Price Guarantee</span>
                                     </div>
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* Shipping & Payment Meta */}
                        <div className="space-y-8">
                           <div>
                              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                                <MapPin size={14} /> Shipping Address
                              </h4>
                              <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs font-bold text-gray-500 leading-relaxed">
                                 <p className="text-[#00081d] font-black italic uppercase mb-2 text-sm">{order.address?.name}</p>
                                 <p>{order.address?.address}</p>
                                 <p>{order.address?.locality}</p>
                                 <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                                 <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-blue-600">
                                    <Clock size={14} />
                                    <span>Est. Delivery: {order.estimatedDelivery?.toDate ? order.estimatedDelivery.toDate().toLocaleDateString() : '3-5 Business Days'}</span>
                                 </div>
                              </div>
                           </div>

                           <div>
                              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                                <CreditCard size={14} /> Payment Meta
                              </h4>
                              <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Gateway</span>
                                    <span className="text-xs font-black italic text-[#00081d]">{order.paymentMethod}</span>
                                 </div>
                                 {order.paymentDetails?.utr && (
                                   <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">UTR / Ref</span>
                                      <span className="text-xs font-black italic text-blue-600">{order.paymentDetails.utr}</span>
                                   </div>
                                 )}
                                 <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Payment Status</span>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-widest ${order.status === 'Payment Verification Pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                       {order.status === 'Payment Verification Pending' ? 'Verifying' : 'Success'}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* Action Buttons */}
                           <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => alert('Invoice feature coming soon! Your order summary is available in the list.')}
                                className="flex items-center justify-center gap-2 py-4 bg-[#00081d] text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                              >
                                 <FileText size={14} /> Invoice
                              </button>
                              {canCancel ? (
                                <button 
                                  onClick={() => cancelOrder(order.id)}
                                  className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-red-100 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all"
                                >
                                   <XCircle size={14} /> Cancel
                                </button>
                              ) : (
                                <button className="flex items-center justify-center gap-2 py-4 bg-gray-50 text-gray-300 rounded-xl font-black uppercase text-[10px] tracking-widest cursor-not-allowed">
                                   <XCircle size={14} /> Fixed State
                                </button>
                              )}
                           </div>
                           {!canCancel && !isCancelled && (
                             <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest leading-none mt-2 flex items-center justify-center gap-1">
                               <AlertCircle size={10} /> Order cannot be cancelled after confirmation
                             </p>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Collapsed Footer Meta */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center md:hidden">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{order.status}</span>
                    <button 
                      onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                      className="text-[10px] font-black text-[#00081d] uppercase tracking-widest underline decoration-blue-600 underline-offset-4"
                    >
                      {selectedOrderId === order.id ? 'Close Details' : 'View Details'}
                    </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

