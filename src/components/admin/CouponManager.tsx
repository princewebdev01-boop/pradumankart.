import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Tag, Percent, IndianRupee, Calendar, CheckCircle2, XCircle, Search } from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  active: boolean;
  createdAt: any;
  expiryDate?: string;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderAmount: 0,
    expiryDate: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching coupons:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || newCoupon.discountValue <= 0) return;

    try {
      setLoading(true);
      await addDoc(collection(db, 'coupons'), {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        active: true,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        expiryDate: ''
      });
    } catch (error) {
      console.error('Error adding coupon:', error);
      alert('Failed to add coupon');
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', id), {
        active: !currentStatus
      });
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm('Clear this discount protocol?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
           <h2 className="text-5xl font-black italic uppercase tracking-tighter text-[#00081d]">Promotion Engine</h2>
           <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">Hyper-Discount Strategy Control — {filteredCoupons.length} logic gates</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          <Plus size={20} /> Initialize New logic
        </button>
      </div>

      {/* Add Coupon Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#00081d]/90 backdrop-blur-xl p-6 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-[#00081d]">Create Coupon</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configure discount parameters</p>
                 </div>
                 <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <XCircle size={24} />
                 </button>
              </div>

              <form onSubmit={handleAddCoupon} className="p-10 space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Coupon Protocol Code</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. PRADUMAN50"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 p-5 rounded-2xl outline-none font-black text-lg transition-all uppercase placeholder:text-gray-300"
                      value={newCoupon.code}
                      onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Discount Mode</label>
                       <select 
                         className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 p-5 rounded-2xl outline-none font-black text-sm transition-all"
                         value={newCoupon.discountType}
                         onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                       >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Discount Value</label>
                       <div className="relative">
                          {newCoupon.discountType === 'fixed' ? <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} /> : <Percent className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
                          <input 
                            required
                            type="number" 
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 p-5 pl-12 rounded-2xl outline-none font-black text-sm transition-all"
                            value={newCoupon.discountValue}
                            onChange={e => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})}
                          />
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Minimum Transaction (₹)</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 p-5 rounded-2xl outline-none font-black text-sm transition-all"
                      value={newCoupon.minOrderAmount}
                      onChange={e => setNewCoupon({...newCoupon, minOrderAmount: Number(e.target.value)})}
                    />
                 </div>

                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Expiry Date (Optional)</label>
                    <div className="relative">
                       <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                         type="date" 
                         className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 p-5 pl-12 rounded-2xl outline-none font-black text-sm transition-all"
                         value={newCoupon.expiryDate}
                         onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                   type="submit"
                   className="w-full bg-[#00081d] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4"
                 >
                    Inject Protocol
                 </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
         <input 
           type="text" 
           placeholder="Search logic gates by code..."
           className="w-full bg-white border-2 border-gray-100 rounded-[2rem] py-6 pl-16 pr-8 font-black text-sm outline-none focus:border-blue-600 shadow-sm transition-all"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredCoupons.map((coupon) => (
            <div key={coupon.id} className={`bg-white rounded-[3rem] p-10 border-2 transition-all relative overflow-hidden group ${coupon.active ? 'border-gray-100' : 'border-red-50 bg-red-50/10'}`}>
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Tag size={120} />
               </div>

               <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${coupon.active ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
                     {coupon.discountType === 'percentage' ? <Percent size={24} /> : <IndianRupee size={24} />}
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => toggleCouponStatus(coupon.id, coupon.active)}
                       className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${coupon.active ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'}`}
                     >
                        <CheckCircle2 size={20} />
                     </button>
                     <button 
                        onClick={() => deleteCoupon(coupon.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                     >
                        <Trash2 size={20} />
                     </button>
                  </div>
               </div>

               <div className="space-y-1 mb-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tight text-[#00081d]">{coupon.code}</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                     {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `${formatINR(coupon.discountValue)} OFF`}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-50">
                  <div>
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Min. Order</p>
                     <p className="font-black text-sm text-[#00081d]">{formatINR(coupon.minOrderAmount)}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                     <p className={`font-black text-[9px] uppercase tracking-widest px-2 py-1 rounded-md inline-block ${coupon.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {coupon.active ? 'Protocol Active' : 'Offline'}
                     </p>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100 shadow-sm">
           <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
              <Tag size={56} />
           </div>
           <p className="text-[#00081d] font-black italic uppercase tracking-tighter text-2xl">No Active logic gates</p>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-3">Reset filters or initialize new protocols</p>
        </div>
      )}
    </div>
  );
}
