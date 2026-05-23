import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Banner } from '../../types';
import { Plus, Trash2, Edit, Save, X, Eye, EyeOff, GripVertical, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('/shop');
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      setBanners(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
    } catch (e) {
      console.error('Error fetching banners:', e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setImage('');
    setLink('/shop');
    setOrder(banners.length);
    setActive(true);
    setEditingBanner(null);
    setIsFormOpen(false);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImage(banner.image);
    setLink(banner.link);
    setOrder(banner.order);
    setActive(banner.active);
    setIsFormOpen(true);
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const bannerData = {
        title,
        subtitle,
        image,
        link,
        order: Number(order),
        active,
        updatedAt: serverTimestamp()
      };

      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), bannerData);
      } else {
        await addDoc(collection(db, 'banners'), {
          ...bannerData,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
      fetchBanners();
    } catch (e) {
      console.error('Error saving banner:', e);
      alert('Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this banner?')) {
      try {
        await deleteDoc(doc(db, 'banners', id));
        fetchBanners();
      } catch (e) {
        console.error('Error deleting banner:', e);
      }
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await updateDoc(doc(db, 'banners', banner.id), {
        active: !banner.active
      });
      fetchBanners();
    } catch (e) {
      console.error('Error toggling banner:', e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[#00081d]">Promotion Banners</h1>
          <p className="text-gray-500 text-sm font-bold uppercase">Manage homepage carousel banners</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black shadow-xl italic tracking-tighter flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 text-lg"
        >
          <Plus size={24} /> CREATE NEW BANNER
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {banners.map((banner) => (
            <motion.div 
              key={banner.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden group relative ${!banner.active ? 'opacity-60 grayscale' : 'border-gray-100'}`}
            >
              <div className="aspect-[16/9] relative bg-gray-100">
                <img 
                  src={banner.image} 
                  alt={banner.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                   <h3 className="text-white font-black italic uppercase tracking-tighter text-xl leading-none">{banner.title}</h3>
                   <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">{banner.subtitle}</p>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                   <button 
                    onClick={() => handleEdit(banner)}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg text-blue-600 hover:bg-white transition-all transform hover:scale-110"
                   >
                     <Edit size={16} />
                   </button>
                   <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg text-red-500 hover:bg-white transition-all transform hover:scale-110"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
                <div className="absolute top-4 left-4">
                  <button 
                    onClick={() => toggleActive(banner)}
                    className={`p-2 rounded-lg shadow-lg backdrop-blur-md transition-all ${banner.active ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}
                  >
                    {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Priority: {banner.order}</span>
                <span className={banner.active ? 'text-green-600' : 'text-gray-400'}>{banner.active ? 'Live' : 'Draft'}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {banners.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
             <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Banners Configured</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-8 py-6 bg-[#00081d] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure homepage billboard</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Banner Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent py-4 px-4 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                    placeholder="e.g. MEGA ELECTRONICS SALE"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subtitle/Offer Text</label>
                  <input 
                    type="text" 
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent py-4 px-4 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                    placeholder="e.g. UP TO 80% OFF"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Image URL</label>
                <input 
                  type="url" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent py-4 px-4 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                  placeholder="Paste direct image link here"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Action Link</label>
                  <input 
                    type="text" 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent py-4 px-4 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                    placeholder="/shop?category=Mobiles"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Display Order (Higher = Later)</label>
                  <input 
                    type="number" 
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full bg-gray-50 border-2 border-transparent py-4 px-4 rounded-xl focus:bg-white focus:border-blue-600 outline-none text-sm font-bold transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                 <input 
                  type="checkbox" 
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                 />
                 <label htmlFor="active" className="text-xs font-black uppercase tracking-widest text-[#00081d]">Mark as Active & Live</label>
              </div>

              {image && (
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Preview</label>
                   <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-xl border-4 border-gray-100">
                      <img src={image} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-12">
                         <div className="text-white space-y-2">
                           <h4 className="text-2xl font-black italic uppercase leading-none">{title || 'BANNER TITLE'}</h4>
                           <p className="text-sm font-bold opacity-80 uppercase tracking-widest">{subtitle || 'Promotional subtitle'}</p>
                         </div>
                      </div>
                   </div>
                 </div>
              )}
            </form>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={resetForm}
                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-[#2874f0] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 group disabled:opacity-50"
              >
                <Save size={16} className="group-hover:scale-110 transition-transform" />
                {loading ? 'Saving...' : editingBanner ? 'UPDATE BANNER' : 'PUBLISH BANNER'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
