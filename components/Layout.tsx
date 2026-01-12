
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Users, Calendar, Wallet, Home as HomeIcon, LogIn, Heart, MessageCircle } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon size={20} /> },
    { label: 'Boys', path: '/boys', icon: <Users size={20} /> },
    { label: 'Events', path: '/events', icon: <Calendar size={20} /> },
    { label: 'Budget', path: '/budget', icon: <Wallet size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-red-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-red-600 text-white p-2 rounded-lg font-black tracking-tighter text-xl">RB</div>
                <span className="text-xl font-bold tracking-tight text-slate-900">RED <span className="text-red-600">BOYS</span></span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${isActive(item.path)
                    ? 'bg-red-50 text-red-600'
                    : 'text-slate-600 hover:text-red-600 hover:bg-red-50/50'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="ml-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <LogIn size={18} />
                Admin
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-red-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${isActive(item.path)
                    ? 'bg-red-50 text-red-600'
                    : 'text-slate-600 hover:text-red-600 hover:bg-red-50/50'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 mt-4 text-center bg-red-600 text-white rounded-lg font-bold"
              >
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/918870449432"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center gap-2 group"
      >
        <MessageCircle size={24} fill="white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
          Contact Red Boys
        </span>
      </a>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <div className="bg-red-600 text-white p-2 rounded-lg font-black tracking-tighter text-xl">RB</div>
                <span className="text-xl font-bold tracking-tight">RED <span className="text-red-600">BOYS</span></span>
              </div>
              <p className="text-slate-400 max-w-xs">
                ஒற்றுமை, கலாச்சாரம், சகோதரத்தால் நம்ம கிராமம் வலிமை அடைகிறது.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-red-500 uppercase tracking-widest text-xs">Quick Links</h4>
                <Link to="/boys" className="text-slate-400 hover:text-white transition-colors">Members</Link>
                <Link to="/events" className="text-slate-400 hover:text-white transition-colors">Recent Events</Link>
                <Link to="/budget" className="text-slate-400 hover:text-white transition-colors">Transparencies</Link>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-red-500 uppercase tracking-widest text-xs">Follow Us</h4>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p className="flex items-center justify-center gap-1 mb-2">
              Made with <Heart size={14} className="text-red-600 fill-red-600" /> by <span className="text-white font-bold">Dineshkumar</span>
            </p>
            <p className="text-xs text-slate-600 mb-4">
              Contact: <a href="mailto:dineshm8870449432@gmail.com" className="hover:text-red-500 transition-colors">dineshm8870449432@gmail.com</a>
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-widest opacity-30">© 2026 Red Boys Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
