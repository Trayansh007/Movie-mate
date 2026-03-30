import React from 'react';
import { Film, LogOut } from 'lucide-react';

export default function Header({ user, onLogout }) {
  // Extract the first letter of the email to use as an avatar
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "G";

  return (
    <header className="sticky top-0 z-50 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30">
            <Film size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            MovieMate
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="text-sm font-bold text-cyan-300">{userInitial}</span>
          </div>
          
          <button 
            onClick={onLogout}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-red-400 transition-all group"
            title="Sign Out"
          >
            <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}