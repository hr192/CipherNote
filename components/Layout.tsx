import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-500 hover:text-indigo-400 transition">
            <ShieldCheck size={24} />
            <span className="font-bold text-xl tracking-tight text-white">CipherNote</span>
          </Link>
          <div className="text-xs text-gray-500 font-mono">
            Zero-Knowledge Encryption
          </div>
        </div>
      </header>
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="border-t border-gray-800 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>Decryption happens entirely in your browser. The server never sees your key.</p>
        </div>
      </footer>
    </div>
  );
};