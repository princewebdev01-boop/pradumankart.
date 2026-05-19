import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Timer, 
  Camera, 
  Smartphone,
  Copy,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Navigate } from 'react-router-dom';
import { formatINR } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDocs, query, where, limit } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { generateOrderId, registerUTR } from '../lib/orderUtils';
import { Tag as TagIcon, Percent, X } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  active: boolean;
}

interface OrderPayload {
  orderId: string;
  userId: string;
  userEmail: string;
  items: any[];
  totalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode: string | null;
  address: any;
  status: string;
  paymentMethod: string;
  paymentDetails: any;
  createdAt: any;
  updatedAt: any;
  estimatedDelivery: Date;
}

export default function Checkout() {
  const { items, totalAmount, clearCart, deliveryFee } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('UPI');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [timer, setTimer] = useState(1800); // 30 minutes countdown
  const [generatedOrderId, setGeneratedOrderId] = useState<string | null>(null);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const [address, setAddress] = useState({
    name: user?.displayName || '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    type: 'home'
  });

  useEffect(() => {
    if (step === 4 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (items.length === 0) return <Navigate to="/cart" />;
  if (!user) return <div className="py-20 text-center"><h2 className="text-2xl font-black uppercase italic">Please Login to Continue</h2></div>;

  const currentTotal = totalAmount();
  const currentDelivery = deliveryFee();
  
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (currentTotal * appliedCoupon.discountValue) / 100;
    }
    return appliedCoupon.discountValue;
  };

  const discountAmount = calculateDiscount();
  const finalTotal = currentTotal + currentDelivery - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    
    try {
      const q = query(
        collection(db, 'coupons'), 
        where('code', '==', couponCode.toUpperCase()),
        where('active', '==', true),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setCouponError('Invalid or expired coupon protocol.');
        return;
      }

      const couponData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Coupon;
      
      if (currentTotal < couponData.minOrderAmount) {
        setCouponError(`Min. order value for this protocol is ${formatINR(couponData.minOrderAmount)}`);
        return;
      }

      setAppliedCoupon(couponData);
      setCouponCode('');
    } catch (err) {
      console.error('Coupon error:', err);
      setCouponError('Communication error during validation.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Max 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const initOrderPlacement = async () => {
    if (!address.phone || !address.address || !address.city || !address.state || !address.pincode) {
      alert('Please fill all required address fields');
      return;
    }
    
    setLoading(true);
    try {
      const oid = await generateOrderId();
      setGeneratedOrderId(oid);
      setStep(4);
    } catch (err) {
      setError('Failed to initialize order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'UPI') {
      if (!utr || utr.length < 12) {
        alert('Please enter a valid 12-digit UTR/Reference ID');
        return;
      }
      if (!screenshot) {
        alert('Please upload a screenshot of your payment');
        return;
      }
    }

    setLoading(true);
    setError('');
    
    try {
      // 1. Verify UTR Uniqueness
      if (paymentMethod === 'UPI') {
        try {
          await registerUTR(generatedOrderId!, utr, user.uid);
        } catch (utrErr: any) {
          setError(utrErr.message);
          setLoading(false);
          return;
        }
      }

      const orderData: OrderPayload = {
        orderId: generatedOrderId!,
        userId: user.uid,
        userEmail: user.email!,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images[0]
        })),
        totalAmount: finalTotal,
        deliveryFee: currentDelivery,
        discountAmount: discountAmount,
        couponCode: appliedCoupon?.code || null,
        address: address,
        status: paymentMethod === 'UPI' ? 'Payment Verification Pending' : 'Processing',
        paymentMethod: paymentMethod,
        paymentDetails: paymentMethod === 'UPI' ? {
          utr: utr,
          screenshot: screenshot, // In production, upload to Firebase Storage, here stored as base64
          status: 'pending'
        } : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalOrders: increment(1),
        totalSpend: increment(finalTotal)
      });

      clearCart();
      navigate('/orders', { state: { newOrder: true } });
    } catch (err) {
      setError('Failed to place order. Security protocols interrupted.');
    } finally {
      setLoading(false);
    }
  };

  // UPI Link generation
  const upiLink = `upi://pay?pa=915532vny@ybl&pn=PRADUMANKART&am=${Math.max(0, finalTotal)}&tn=${generatedOrderId || 'Order'}&tr=${generatedOrderId || ''}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Progress System */}
        <div className="lg:w-2/3 space-y-6">
          
          {/* Section 1: Identity */}
          <div className="bg-white border-2 border-gray-100 rounded-[2rem] overflow-hidden transition-all shadow-sm">
             <div className={`p-6 flex items-center justify-between ${step === 1 ? 'bg-[#00081d] text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${step === 1 ? 'bg-white text-[#00081d]' : 'bg-gray-200 text-gray-400'}`}>1</div>
                   <h3 className="font-black italic uppercase tracking-widest text-sm">Identity Check</h3>
                </div>
                {step > 1 && <CheckCircle2 className="text-green-500" size={20} />}
             </div>
             {step === 1 && (
               <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authorized User</p>
                     <p className="font-black italic text-xl text-[#00081d] uppercase tracking-tighter">{user.displayName || 'Guest User'}</p>
                     <p className="text-xs font-bold text-gray-500">{user.email}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="bg-[#fb641b] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#fb641b]/20 active:scale-95 transition-all">Proceed to Logistics</button>
               </div>
             )}
          </div>

          {/* Section 2: Logistics */}
          <div className="bg-white border-2 border-gray-100 rounded-[2rem] overflow-hidden transition-all shadow-sm">
             <div className={`p-6 flex items-center justify-between ${step === 2 ? 'bg-[#00081d] text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${step === 2 ? 'bg-white text-[#00081d]' : 'bg-gray-200 text-gray-400'}`}>2</div>
                   <h3 className="font-black italic uppercase tracking-widest text-sm">Delivery Infrastructure</h3>
                </div>
                {step > 2 && <CheckCircle2 className="text-green-500" size={20} />}
             </div>
             {step === 2 && (
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <input type="text" placeholder="Recipient Name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="bg-gray-50 border-2 border-transparent focus:border-blue-600 p-4 rounded-xl outline-none font-bold text-sm transition-all" />
                     <input type="tel" placeholder="Secure Contact Number" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="bg-gray-50 border-2 border-transparent focus:border-blue-600 p-4 rounded-xl outline-none font-bold text-sm transition-all" />
                     <input type="text" placeholder="Postal Code / PIN" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="bg-gray-50 border-2 border-transparent focus:border-blue-600 p-4 rounded-xl outline-none font-bold text-sm transition-all" />
                     <input type="text" placeholder="Locality / Landmark" value={address.locality} onChange={e => setAddress({...address, locality: e.target.value})} className="bg-gray-50 border-2 border-transparent focus:border-blue-600 p-4 rounded-xl outline-none font-bold text-sm transition-all" />
                  </div>
                  <textarea placeholder="Full Strategic Address (Area, Street, Unit)" value={address.address} onChange={e => setAddress({...address, address: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 p-4 rounded-xl outline-none font-bold text-sm transition-all h-32" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <input type="text" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="bg-gray-50 border-2 border-transparent focus:border-blue-600 p-4 rounded-xl outline-none font-bold text-sm transition-all" />
                     <select value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="bg-gray-50 border-2 border-transparent focus:border-blue-600 p-4 rounded-xl outline-none font-bold text-sm transition-all">
                        <option value="">Select Region</option>
                        {['Bihar', 'Delhi', 'Maharashtra', 'Karnataka', 'UP', 'Gujarat', 'Tamil Nadu', 'West Bengal'].map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setStep(3)} className="bg-[#fb641b] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#fb641b]/20 hover:scale-105 transition-all">Confirm Destination</button>
                  </div>
               </div>
             )}
          </div>

          {/* Section 3: Intelligence Review (Order Summary) */}
          <div className="bg-white border-2 border-gray-100 rounded-[2rem] overflow-hidden transition-all shadow-sm">
             <div className={`p-6 flex items-center justify-between ${step === 3 ? 'bg-[#00081d] text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${step === 3 ? 'bg-white text-[#00081d]' : 'bg-gray-200 text-gray-400'}`}>3</div>
                   <h3 className="font-black italic uppercase tracking-widest text-sm">Inventory Intel</h3>
                </div>
                {step > 3 && <CheckCircle2 className="text-green-500" size={20} />}
             </div>
             {step === 3 && (
               <div className="p-8 space-y-6">
                  <div className="space-y-4">
                     {items.map(item => (
                        <div key={item.id} className="flex gap-4 items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                           <img src={item.images[0]} className="w-16 h-16 object-contain mix-blend-multiply" />
                           <div className="flex-grow">
                              <h4 className="font-black italic text-sm text-[#00081d] uppercase tracking-tighter truncate">{item.name}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity: {item.quantity}</p>
                           </div>
                           <div className="text-right">
                              <p className="font-black text-[#00081d] text-sm italic">{formatINR(item.price * item.quantity)}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="flex justify-between items-center bg-[#00081d] p-6 rounded-3xl text-white">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Verified Logistics Summary</p>
                     <button onClick={initOrderPlacement} disabled={loading} className="bg-white text-[#00081d] px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                        {loading ? 'Securing ID...' : 'Initialize Payment Flow'}
                     </button>
                  </div>
               </div>
             )}
          </div>

          {/* Section 4: Secure Transaction Layer */}
          <div className={`bg-white border-2 rounded-[2.5rem] overflow-hidden transition-all shadow-xl ${step === 4 ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-100 opacity-60'}`}>
             <div className={`p-8 flex items-center justify-between ${step === 4 ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${step === 4 ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-400'}`}>4</div>
                   <h3 className="font-black italic uppercase tracking-widest text-sm">Financial Verification</h3>
                </div>
                {step === 4 && (
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full font-black text-[10px] uppercase italic tracking-widest">
                     <Clock size={12} /> {formatTime(timer)}
                  </div>
                )}
             </div>

             {step === 4 && (
               <div className="p-10 space-y-10">
                  <div className="flex flex-col xl:flex-row gap-12 items-start">
                     <div className="flex flex-col items-center gap-4 group">
                        <div className="p-6 bg-white border-4 border-[#00081d]/5 rounded-[3rem] shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                           <QRCodeSVG value={upiLink} size={180} />
                           <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck size={12} className="text-blue-600" /> End-to-End Encrypted QR
                        </p>
                     </div>

                     <div className="flex-grow space-y-8">
                        <div className="flex flex-wrap gap-4">
                           <div className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Protocol ID</p>
                              <p className="font-black text-[#00081d] italic text-lg uppercase tracking-tighter">{generatedOrderId}</p>
                           </div>
                           <div className="px-6 py-4 bg-blue-50 border border-blue-100 rounded-3xl">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-2">Verification Amount</p>
                              <p className="font-black text-blue-600 italic text-lg uppercase tracking-tighter">{formatINR(finalTotal)}</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="font-black italic text-[#00081d] uppercase text-sm flex items-center gap-2">
                              <Smartphone size={16} /> Direct Interface
                           </h4>
                           <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                              <div className="flex items-center justify-between">
                                 <code className="font-black text-[#00081d] text-sm">915532vny@ybl</code>
                                 <button onClick={() => { navigator.clipboard.writeText('915532vny@ybl'); alert('UPI ID COPIED'); }} className="flex items-center gap-1.5 text-blue-600 font-black uppercase text-[10px] tracking-widest">
                                    <Copy size={12} /> Copy ID
                                 </button>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">
                                 Scanning this QR automatically attaches your Order ID <b>{generatedOrderId}</b> to the transaction note for instant identification.
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8 pt-8 border-t border-gray-50">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction ID (UTR)</label>
                           <input 
                             type="text" 
                             placeholder="12-digit numeric code"
                             maxLength={12}
                             value={utr}
                             onChange={e => setUtr(e.target.value)}
                             className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 p-5 rounded-2xl outline-none font-black italic tracking-widest focus:bg-white transition-all shadow-sm"
                           />
                           <p className="text-[9px] font-bold text-gray-300 italic">Available in your bank SMS or UPI transaction history</p>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Proof of Transaction</label>
                           <div className="relative group">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className={`p-5 rounded-2xl border-2 border-dashed transition-all flex items-center gap-4 ${screenshot ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:border-blue-300'}`}>
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${screenshot ? 'bg-green-500 text-white' : 'bg-white text-gray-300 shadow-sm'}`}>
                                    <Camera size={20} />
                                 </div>
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${screenshot ? 'text-green-600' : 'text-gray-400'}`}>
                                    {screenshot ? 'Identity Evidence Captured' : 'Upload Screenshot (Max 5MB)'}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {error && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
                           <AlertCircle size={20} />
                           <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                        </motion.div>
                     )}

                     <button 
                       onClick={handlePlaceOrder}
                       disabled={loading || !utr || !screenshot}
                       className="w-full bg-[#fb641b] text-white py-6 rounded-3xl font-black italic uppercase tracking-[0.2em] text-sm shadow-2xl shadow-[#fb641b]/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                     >
                        {loading ? 'VERIFYING SECURITY TOKENS...' : (
                          <span className="flex items-center justify-center gap-3">
                             FINAL ORDER AUTHENTICATION <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                     </button>
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:w-1/3">
           <div className="bg-[#00081d] rounded-[3rem] p-10 text-white shadow-2xl sticky top-24">
              <div className="pb-8 border-b border-white/10 space-y-1">
                 <h3 className="font-black italic text-2xl uppercase tracking-tighter">Mission Statement</h3>
                 <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest opacity-80 italic">Verified Ledger Summary</p>
              </div>

              <div className="py-8 space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Gross Liquidity</span>
                    <span className="font-black italic">{formatINR(currentTotal)}</span>
                 </div>
                 
                 {appliedCoupon && (
                   <div className="flex justify-between items-center text-blue-400">
                      <div className="flex items-center gap-2">
                         <TagIcon size={12} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Protocol: {appliedCoupon.code}</span>
                      </div>
                      <span className="font-black italic">-{formatINR(discountAmount)}</span>
                   </div>
                 )}

                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Logistics Overhead</span>
                    <span className={`font-black italic ${currentDelivery === 0 ? 'text-green-400' : ''}`}>
                       {currentDelivery === 0 ? 'COMPLIMENTARY' : formatINR(currentDelivery)}
                    </span>
                 </div>
                 <div className="h-px bg-white/5" />
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400 italic">Financial Payload</span>
                    <span className="text-4xl font-black italic text-white tracking-tighter">{formatINR(finalTotal)}</span>
                 </div>
              </div>

               {/* Coupon Interface */}
               {step < 4 && !appliedCoupon && (
                  <div className="pt-4 pb-8 border-t border-white/5 space-y-4">
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Insert Discount Protocol</p>
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           placeholder="COUPON CODE"
                           className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-all placeholder:opacity-20"
                           value={couponCode}
                           onChange={e => setCouponCode(e.target.value)}
                        />
                        <button 
                           onClick={handleApplyCoupon}
                           className="bg-blue-600 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                        >
                           VERIFY
                        </button>
                     </div>
                     {couponError && <p className="text-[9px] font-bold text-red-400 uppercase italic">{couponError}</p>}
                  </div>
               )}

               {appliedCoupon && step < 4 && (
                  <div className="pt-4 pb-8 border-t border-white/5">
                     <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                              <TagIcon size={16} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 leading-none mb-1">{appliedCoupon.code}</p>
                              <p className="text-[9px] font-bold text-white/40 uppercase italic">Protocol Online</p>
                           </div>
                        </div>
                        <button onClick={() => setAppliedCoupon(null)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white">
                           <X size={16} />
                        </button>
                     </div>
                  </div>
               )}

              <div className="pt-8 space-y-4">
                 <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center gap-4">
                    <ShieldCheck size={40} className="text-blue-500 shrink-0" />
                    <p className="text-[9px] font-bold text-white/50 leading-relaxed uppercase tracking-wider">
                       This order is processed via our direct UPI interface. Our security team verifies every UTR against the central ledger to prevent duplicate authorization.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
