import React, { useState, useEffect } from 'react';
import { X, Upload, Save, AlertCircle } from 'lucide-react';
import { Product, Section } from '../../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    category: '',
    stock: 0,
    images: [''],
    sectionId: '',
    isAssured: true,
    ...product
  });

  const [sections, setSections] = useState<Section[]>([]);
  const [previewImage, setPreviewImage] = useState(product?.images[0] || '');

  useEffect(() => {
    const fetchSections = async () => {
      const querySnapshot = await getDocs(collection(db, 'sections'));
      const sectionList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
      setSections(sectionList.filter(s => s.type === 'products'));
    };
    fetchSections();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image and Status */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Product Image URL</label>
              <div className="space-y-4">
                <div className="relative group aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-sm flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload size={48} strokeWidth={1} />
                      <span className="text-[10px] font-bold uppercase">No Image Preview</span>
                    </div>
                  )}
                </div>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none text-sm font-bold"
                  value={formData.images?.[0] || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    setFormData({ ...formData, images: [url] });
                    setPreviewImage(url);
                  }}
                  required
                />
                <p className="text-[10px] text-gray-400 font-medium">
                  <AlertCircle size={10} className="inline mr-1" />
                  Ensure the image accurately represents the product to avoid user confusion.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-sm border border-blue-100">
              <input 
                type="checkbox" 
                id="isAssured"
                checked={formData.isAssured}
                onChange={(e) => setFormData({ ...formData, isAssured: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="isAssured" className="text-sm font-bold text-blue-900 cursor-pointer flex items-center gap-2">
                Flipkart Assured Badge
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/plus_aef861.png" alt="FA" className="h-3" />
              </label>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Product Name</label>
              <input 
                type="text" 
                className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none text-base font-black italic uppercase tracking-tight"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Category</label>
                <select 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none text-sm font-bold bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home</option>
                  <option value="Appliances">Appliances</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Homepage Row</label>
                <select 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none text-sm font-bold bg-white"
                  value={formData.sectionId}
                  onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                >
                  <option value="">No Row (Shop only)</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Price (₹)</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none text-sm font-black"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Original Price</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none text-sm font-bold text-gray-400"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Stock</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-600 outline-none text-sm font-bold"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Description</label>
              <textarea 
                className="w-full border-2 border-gray-100 p-3 focus:border-blue-600 outline-none text-sm font-medium rounded-sm min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="submit"
                className="flex-grow bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-sm shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> SAVE PRODUCT
              </button>
              <button 
                type="button"
                onClick={onCancel}
                className="px-8 border-2 border-gray-100 font-bold uppercase text-xs tracking-widest hover:bg-gray-50 rounded-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
