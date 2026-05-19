import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, History, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../constants';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof PRODUCTS>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (pName?: string) => {
    const searchTerm = pName || query;
    if (searchTerm.trim()) {
      setIsFocused(false);
      navigate(`/shop?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div ref={searchRef} className="flex-grow relative z-[60]">
      <div className="relative flex items-center h-full bg-white">
        <div className="flex-grow flex items-center px-4">
          <input 
            type="text" 
            placeholder="Search for products, brands and more"
            className="w-full py-2 bg-transparent text-gray-800 text-sm focus:outline-none placeholder:text-gray-500 font-medium"
            value={query}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {query.length < 2 && (
              <div className="p-4 bg-gray-50/50">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Discover More</h4>
                <div className="flex flex-wrap gap-2">
                  {['iPhone 15', 'Sony WH-1000XM5', 'Sneakers', 'Laptops', 'Watches'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => { setQuery(tag); handleSearch(tag); }}
                      className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2"
                    >
                      <TrendingUp size={12} /> {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-50">
              {suggestions.length > 0 ? (
                suggestions.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => { setQuery(p.name); handleSearch(p.name); }}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left group transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center p-1 group-hover:bg-white border border-transparent group-hover:border-gray-100">
                       <img src={p.images[0]} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#00081d] truncate group-hover:text-blue-600 leading-tight uppercase italic">{p.name}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.category}</span>
                    </div>
                    <History size={14} className="ml-auto text-gray-300 opacity-0 group-hover:opacity-100" />
                  </button>
                ))
              ) : query.length >= 2 ? (
                <div className="p-10 text-center space-y-3">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                      <Package size={32} className="text-gray-300" />
                   </div>
                   <p className="text-sm font-black text-gray-400 uppercase tracking-tighter italic">No matches found for "{query}"</p>
                </div>
              ) : null}
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Clear search history</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
