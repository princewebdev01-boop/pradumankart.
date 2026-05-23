import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Section } from '../../types';

export default function SectionManager() {
  const [sections, setSections] = useState<(Section & { productCount?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Section>>({
    title: '',
    subtitle: '',
    type: 'products',
    order: 0,
    active: true
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'sections'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const sectionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
      
      const productsSnap = await getDocs(collection(db, 'products'));
      const products = productsSnap.docs.map(doc => doc.data());
      
      const sectionsWithCounts = sectionsData.map(section => ({
        ...section,
        productCount: products.filter(p => p.sectionId === section.id).length
      }));

      setSections(sectionsWithCounts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'sections', editingId), formData);
      } else {
        await addDoc(collection(db, 'sections'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ title: '', subtitle: '', type: 'products', order: sections.length, active: true });
      fetchSections();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this section?')) {
      await deleteDoc(doc(db, 'sections', id));
      fetchSections();
    }
  };

  const toggleActive = async (section: Section) => {
    await updateDoc(doc(db, 'sections', section.id), { active: !section.active });
    fetchSections();
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Sections</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-sm font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> ADD SECTION
        </button>
      </header>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-sm shadow-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Section Title</label>
                <input 
                  type="text" 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none font-bold"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Subtitle (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none font-bold text-gray-500"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Type</label>
                <select 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none font-bold bg-white"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="products">Product Grid</option>
                  <option value="banner">Promotional Banner</option>
                  <option value="categories">Category List</option>
                  <option value="featured">Featured Product</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Display Order</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none font-bold"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="bg-[#fb641b] text-white px-8 py-3 font-bold uppercase text-sm shadow-lg hover:shadow-2xl transition-all flex items-center gap-2">
              <Save size={18} /> {editingId ? 'Update Section' : 'Create Section'}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-8 font-bold uppercase text-xs tracking-widest text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className={`bg-white p-6 rounded-sm shadow-md border-l-4 flex items-center justify-between transition-all ${section.active ? 'border-l-blue-600' : 'border-l-gray-300 bg-gray-50'}`}
          >
            <div className="flex items-center gap-6">
              <div className="text-gray-300 cursor-grab active:cursor-grabbing"><GripVertical size={20} /></div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-lg uppercase italic tracking-tighter text-[#00081d]">{section.title}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    section.type === 'products' ? 'bg-blue-100 text-blue-600' : 
                    section.type === 'banner' ? 'bg-orange-100 text-orange-600' : 
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {section.type}
                  </span>
                </div>
                {section.subtitle && <p className="text-xs text-gray-400 font-bold uppercase mt-1">{section.subtitle}</p>}
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                   <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{section.productCount || 0} Linked Products</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-gray-300 uppercase mb-1">Order</span>
                 <span className="font-black text-[#2874f0]">{section.order}</span>
              </div>
              <button 
                onClick={() => toggleActive(section)}
                className={`p-2 rounded-full transition-colors ${section.active ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                title={section.active ? "Deactivate" : "Activate"}
              >
                {section.active ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setEditingId(section.id); setFormData(section); }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(section.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && !loading && (
          <div className="py-20 text-center bg-white rounded-sm border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest">No custom sections yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
