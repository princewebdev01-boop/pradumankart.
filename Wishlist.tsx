import { Link } from 'react-router-dom';
import { ShoppingCart, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#00081d] text-white pt-12 pb-24 md:pb-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-yellow-400 rounded-sm flex items-center justify-center p-2">
                 <ShoppingCart size={24} className="text-[#00081d] fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl leading-none tracking-tight text-white">PRADUMAN</span>
                <span className="font-bold text-base leading-none text-yellow-400">KART</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Premium ecommerce for India. COD enabled, UPI ready, free delivery above ₹500.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-6 uppercase tracking-wider">Contact</h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-yellow-400" />
                <span>+91 9155328308</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-yellow-400" />
                <span className="break-all">princewebdev01@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-6 uppercase tracking-wider">Payments</h3>
            <div className="space-y-4 text-sm font-medium">
              <p>UPI: 915532vny@ybl</p>
              <p className="text-gray-400">COD, UPI, Razorpay placeholder</p>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-6 uppercase tracking-wider">Policies</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/policies/shipping" className="hover:text-yellow-400 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/policies/return" className="hover:text-yellow-400 transition-colors">Return Policy</Link></li>
              <li><Link to="/policies/refund" className="hover:text-yellow-400 transition-colors">Refund Policy</Link></li>
              <li><Link to="/policies/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policies/terms" className="hover:text-yellow-400 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} PRADUMANKART. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
