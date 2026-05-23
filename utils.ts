import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  if (isHome) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        onClick={() => navigate(-1)}
        className="fixed bottom-24 right-6 z-[150] w-14 h-14 bg-[#00081d] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform border border-white/10 md:bottom-8 md:right-8"
        title="Go Back"
      >
        <ArrowLeft size={24} />
      </motion.button>
    </AnimatePresence>
  );
}
