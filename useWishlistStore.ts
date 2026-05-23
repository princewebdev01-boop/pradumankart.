import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Trash2, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { formatINR } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalAmount, deliveryFee } = useCartStore();
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmountValue = totalAmount();
  const deliveryFeeValue = deliveryFee();
  const savings = items.reduce((acc, item) => acc + (item.originalPrice - item.price) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center bg-white shadow-xl my-10 rounded-2xl border border-gray-100">
        <div className="w-32 h-32 bg-yellow-50 rounded-full flex items-center justify-center mb-8">
           <ShoppingCart size={64} className="text-yellow-500 opacity-20" />
        </div>
        <h2 className="text-3xl font-black text-[#00081d] italic uppercase tracking-tighter mb-2">Your cart is empty!</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-8">Add items to it now to start shopping</p>
        <Link to="/" className="bg-[#fb641b] text-white px-12 py-4 rounded-lg font-black shadow-2xl hover:bg-[#e65a15] uppercase tracking-widest active:scale-95 transition-all">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
      {/* Items Section */}
      <div className="flex-grow space-y-4">
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-black text-[#00081d] italic uppercase tracking-tighter">My Cart ({totalItems})</h2>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Truck size={14} /> FREE Delivery
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col md:flex-row gap-8 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-32 h-32 bg-white rounded-lg border border-gray-100 p-2 flex items-center justify-center shadow-sm">
                    <img src={item.images[0]} alt={item.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex items-center bg-white border-2 border-gray-100 rounded-lg overflow-hidden shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-lg font-black hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-black text-[#00081d]">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-lg font-black hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-[#00081d] leading-tight hover:text-blue-600 cursor-pointer uppercase italic">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{item.category}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-2xl font-black text-[#00081d]">₹{item.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through font-bold">₹{item.originalPrice.toLocaleString()}</span>
                    <span className="text-xs text-green-600 font-black uppercase tracking-widest">{item.discount}% Off</span>
                  </div>

                  <div className="mt-auto pt-8 flex gap-6">
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#00081d] hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-all">Save for later</button>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 border-b-2 border-transparent hover:border-red-600 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="md:w-48 text-[11px] font-bold text-gray-500 uppercase tracking-tight text-right hidden md:block">
                  Delivery by <span className="text-[#00081d]">Tomorrow</span> | <span className="text-green-600 font-black">FREE</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0 z-10 shadow-2xl flex justify-end">
            <Link to="/checkout" className="w-full md:w-auto bg-[#fb641b] text-white px-16 py-4 rounded-lg font-black shadow-2xl hover:bg-[#e65a15] flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 transition-all">
              Place Order <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Price Details Section */}
      <div className="lg:w-96 flex-shrink-0">
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 sticky top-24 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-[#00081d] font-black uppercase text-xs tracking-widest italic leading-none">Price Details</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4 text-sm font-bold text-gray-500">
              <div className="flex justify-between uppercase tracking-tight">
                <span>Price ({totalItems} items)</span>
                <span className="text-[#00081d]">₹{items.reduce((acc, i) => acc + i.originalPrice * i.quantity, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between uppercase tracking-tight">
                <span>Discount</span>
                <span className="text-green-600">- ₹{savings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between uppercase tracking-tight">
                <span>Delivery Charges</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 line-through">₹69</span>
                  <span className="text-green-600 font-black uppercase tracking-widest text-[10px]">Free</span>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
               <span className="text-lg font-black text-[#00081d] uppercase italic tracking-tighter">Total Amount</span>
               <span className="text-2xl font-black text-[#00081d]">₹{(totalAmountValue + deliveryFeeValue).toLocaleString()}</span>
            </div>

            <div className="bg-green-50 text-green-700 font-black text-[10px] py-3 rounded-lg uppercase tracking-widest text-center border border-green-100">
              You will save ₹{savings.toLocaleString()} on this order
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-4 p-4 text-gray-400 font-bold text-[11px] leading-tight uppercase tracking-widest">
          <ShieldCheck size={32} className="text-blue-600 shrink-0" />
          <span>Safe and Secure Payments. Easy returns. 100% Authentic products. Verified Seller Network.</span>
        </div>
      </div>
    </div>
  );
}
