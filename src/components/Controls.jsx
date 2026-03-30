import React from 'react';
import { Search } from 'lucide-react';

export default function Controls({ searchTerm, setSearchTerm, selectedGenre, setSelectedGenre, genres }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-8 mb-12 flex flex-col items-center gap-8">
      
      {/* Glass Search Bar */}
      <div className="relative w-full max-w-2xl group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors" size={22} />
        <input 
          type="text" 
          placeholder="Search for movies..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-6 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/20 shadow-2xl transition-all text-lg"
        />
      </div>

      {/* Glass Genre Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {genres.map(genre => (
          <button 
            key={genre.id}
            onClick={() => { setSelectedGenre(genre.id); setSearchTerm(""); }}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide backdrop-blur-md transition-all duration-300 border ${
              selectedGenre === genre.id 
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105" 
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

    </div>
  );
}