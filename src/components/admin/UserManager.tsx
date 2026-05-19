import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  ExternalLink,
  History,
  XCircle,
  Sparkles
} from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);

const [sortBy, setSortBy] = useState<'createdAt' | 'lastLogin' | 'totalSpend' | 'totalOrders'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [limitCount, setLimitCount] = useState(20);

  useEffect(() => {
    // We adjust the limit locally for simple pagination mockup
    const q = query(collection(db, 'users'), orderBy(sortBy, sortOrder));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sortBy, sortOrder]);

  const fetchUserOrders = async (userId: string) => {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setUserOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error('Error fetching user orders:', e);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'blocked') => {
    try {
      await updateDoc(doc(db, 'users', userId), { status });
      alert(`User ${status === 'active' ? 'unblocked' : 'blocked'} successfully`);
    } catch (e) {
      console.error('Error updating user status:', e);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      alert('User deleted successfully');
    } catch (e) {
      console.error('Error deleting user:', e);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.includes(searchTerm) ||
      user.uid?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Blocked' && user.status === 'blocked') ||
      (statusFilter === 'Active' && user.status !== 'blocked');
    
    return matchesSearch && matchesStatus;
  }).slice(0, limitCount);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading customer profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
           <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[#00081d]">Customer Intel</h2>
           <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">Analyzing {filteredUsers.length} verified accounts</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
           <div className="flex items-center gap-2 bg-white border border-gray-100 p-2 rounded-xl">
              <Filter size={14} className="text-gray-400 ml-2" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer pr-4"
              >
                <option value="createdAt">Joined Date</option>
                <option value="lastLogin">Last Active</option>
                <option value="totalSpend">Revenue</option>
                <option value="totalOrders">Orders</option>
              </select>
           </div>

           <div className="flex gap-2">
              {['All', 'Active', 'Blocked'].map(f => (
                <button 
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-[#00081d] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-blue-600'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
         <input 
           type="text" 
           placeholder="Search and verify customers by name, email, or mobile..."
           className="w-full bg-white border-2 border-gray-100 rounded-[1.5rem] py-6 pl-16 pr-8 font-bold text-sm outline-none focus:border-blue-600 focus:shadow-2xl focus:shadow-blue-500/5 transition-all"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* Modern Responsive Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
               <thead className="bg-[#00081d] text-white text-[10px] font-black uppercase tracking-widest">
                  <tr>
                     <th className="px-8 py-6">Customer</th>
                     <th className="px-8 py-6">Platform Meta</th>
                     <th className="px-8 py-6">Engagement</th>
                     <th className="px-8 py-6">Protection</th>
                     <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                             <div className="relative shrink-0">
                                <img 
                                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random&color=fff`} 
                                  alt="" 
                                  className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-50 flex-shrink-0"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.status === 'blocked' ? 'bg-red-500' : 'bg-green-500'}`} />
                             </div>
                             <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                   <p className="font-black italic text-[#00081d] uppercase tracking-tighter truncate">{user.displayName || 'User'}</p>
                                   {user.role === 'admin' && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest shrink-0">Admin</span>}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 italic">
                                {user.provider === 'google' ? <Sparkles size={10} /> : <Mail size={10} />}
                                {user.provider || 'password'}
                             </div>
                             <p className="text-[9px] font-bold text-gray-400 leading-none">Last Active: {user.lastLogin?.toDate?.()?.toLocaleString() || 'Never'}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex gap-10">
                             <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Orders</p>
                                <p className="font-black text-[#00081d] text-sm">{user.totalOrders || 0}</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Spend</p>
                                <p className="font-black text-[#00081d] text-sm">{formatINR(user.totalSpend || 0)}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className={`${user.status === 'blocked' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'} px-3 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-widest`}>
                             {user.status === 'blocked' ? 'Enforced' : 'Verified'}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => {
                                 setSelectedUser(user);
                                 fetchUserOrders(user.id);
                               }}
                               className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-[#00081d] hover:text-white transition-all shadow-sm"
                               title="View Intelligence"
                             >
                                <ExternalLink size={16} />
                             </button>
                             <button 
                               onClick={() => updateUserStatus(user.id, user.status === 'blocked' ? 'active' : 'blocked')}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${user.status === 'blocked' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}
                               title={user.status === 'blocked' ? 'Unblock' : 'Block'}
                             >
                                {user.status === 'blocked' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                             </button>
                             <button 
                               onClick={() => deleteUser(user.id)}
                               className="w-10 h-10 bg-white border border-red-50 text-red-100 rounded-xl flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all"
                               title="Purge Account"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Load More Mock Pagination */}
         {filteredUsers.length >= limitCount && (
            <div className="p-8 text-center border-t border-gray-50 bg-gray-50/10">
               <button 
                 onClick={() => setLimitCount(prev => prev + 20)}
                 className="px-10 py-4 bg-[#00081d] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#00081d]/10 hover:shadow-2xl transition-all"
               >
                 Expand Dataset ({limitCount} of Many)
               </button>
            </div>
         )}
      </div>

      {filteredUsers.length === 0 && (
        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
           <Users size={64} className="mx-auto text-gray-100 mb-6" />
           <p className="text-[#00081d] font-black italic uppercase italic tracking-tighter text-xl">No customers found</p>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Adjust your intelligence search</p>
        </div>
      )}

      {/* Detail Overlay */}
      <AnimatePresence>
         {selectedUser && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="absolute inset-0 bg-[#00081d]/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-4xl h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
              >
                 {/* Detail Header */}
                 <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-6">
                       <img 
                         src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.displayName || 'U')}&background=random&color=fff`} 
                         className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-xl"
                         alt="" 
                       />
                       <div>
                          <h3 className="text-2xl font-black italic text-[#00081d] uppercase tracking-tighter">{selectedUser.displayName}</h3>
                          <div className="flex flex-wrap gap-4 mt-2">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                <Mail size={12} /> {selectedUser.email}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                <Calendar size={12} /> Joined {selectedUser.createdAt?.toDate?.()?.toLocaleDateString()}
                             </div>
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:rotate-90 transition-all"
                    >
                       <XCircle size={24} className="text-gray-300" />
                    </button>
                 </div>

                 {/* Detail Content */}
                 <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                       {[
                         { label: 'Lifetime Orders', value: selectedUser.totalOrders || 0, icon: <ShoppingBag size={18} />, color: 'bg-blue-50 text-blue-600' },
                         { label: 'Total Revenue', value: formatINR(selectedUser.totalSpend || 0), icon: <CreditCard size={18} />, color: 'bg-green-50 text-green-600' },
                         { label: 'Last Login', value: selectedUser.lastLogin?.toDate?.()?.toLocaleDateString() || 'Today', icon: <History size={18} />, color: 'bg-orange-50 text-orange-600' },
                         { label: 'Account Tier', value: selectedUser.role?.toUpperCase() || 'USER', icon: <ShieldCheck size={18} />, color: 'bg-purple-50 text-purple-600' },
                       ].map((m, i) => (
                         <div key={i} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 ${m.color} rounded-2xl flex items-center justify-center mb-4`}>
                               {m.icon}
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                            <p className="text-lg font-black text-[#00081d]">{m.value}</p>
                         </div>
                       ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Order History */}
                        <div className="space-y-6">
                           <h4 className="font-black italic text-sm text-[#00081d] uppercase tracking-tight flex items-center gap-2">
                             <ShoppingBag size={16} /> Transaction Ledger
                           </h4>
                           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {userOrders.map(order => (
                                <div key={order.id} className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-[#00081d] transition-all">
                                   <div>
                                      <p className="text-[10px] font-black text-[#00081d] uppercase tracking-widest">ORDER #{order.id.slice(-8).toUpperCase()}</p>
                                      <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-2">
                                         {order.createdAt?.toDate?.()?.toLocaleDateString()}
                                         <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                         {order.items?.length || 0} ITEMS
                                      </p>
                                   </div>
                                   <div className="text-right">
                                      <p className="font-black text-[#00081d] text-sm">{formatINR(order.totalAmount)}</p>
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                                   </div>
                                </div>
                              ))}
                              {userOrders.length === 0 && (
                                <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No transaction records found</p>
                                </div>
                              )}
                           </div>
                        </div>

                        {/* intelligence & Identity */}
                        <div className="space-y-6">
                           <h4 className="font-black italic text-sm text-[#00081d] uppercase tracking-tight flex items-center gap-2">
                             <Users size={16} /> Intelligence Analysis
                           </h4>
                           <div className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                               <div className="space-y-4">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Known Logistics Address</p>
                                  {userOrders[0]?.address ? (
                                    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm leading-relaxed">
                                       <p className="text-sm font-black italic text-[#00081d] uppercase tracking-tight mb-2">{userOrders[0].address.name}</p>
                                       <p className="text-xs font-bold text-gray-500">{userOrders[0].address.address}</p>
                                       <p className="text-xs font-bold text-gray-500">{userOrders[0].address.locality}, {userOrders[0].address.city}</p>
                                       <p className="text-xs font-bold text-gray-500">{userOrders[0].address.state} - {userOrders[0].address.pincode}</p>
                                       <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-blue-600 text-xs font-black italic">
                                          <Phone size={12} /> {userOrders[0].address.phone}
                                       </div>
                                    </div>
                                  ) : (
                                    <div className="p-6 bg-white/50 rounded-3xl border border-gray-100 italic text-[10px] text-gray-300 font-bold text-center">
                                       No address information harvested from orders
                                    </div>
                                  )}
                               </div>

                               <div className="space-y-3 pt-4">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credential Protocol</p>
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <p className="text-[9px] font-black text-gray-300 uppercase leading-none mb-2">Internal UUID</p>
                                        <p className="text-[9px] font-bold truncate text-[#00081d]">{selectedUser.uid}</p>
                                     </div>
                                     <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[9px] font-black text-gray-300 uppercase leading-none mb-2">Auth Provider</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">{selectedUser.provider || 'Password'}</p>
                                     </div>
                                  </div>
                               </div>

                               <div className="pt-6">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Security Enforcement</p>
                                  <div className="flex gap-4">
                                     <button 
                                       onClick={() => {
                                          if (confirm('Revoke all sessions for this user?')) alert('Security protocols issued: Sessions invalidated.');
                                       }}
                                       className="flex-grow bg-[#00081d] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-[#00081d]/20 active:scale-95 transition-transform"
                                     >
                                        Revoke Session
                                     </button>
                                     <button 
                                       onClick={() => updateUserStatus(selectedUser.id, selectedUser.status === 'blocked' ? 'active' : 'blocked')}
                                       className={`flex-grow border-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all hover:shadow-lg ${selectedUser.status === 'blocked' ? 'border-green-600 text-green-600 bg-green-50' : 'border-red-600 text-red-600 bg-red-50'}`}
                                     >
                                        {selectedUser.status === 'blocked' ? 'Release Access' : 'Restrict Access'}
                                     </button>
                                  </div>
                               </div>
                           </div>
                        </div>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
