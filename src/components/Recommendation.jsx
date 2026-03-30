import React from 'react';
import { Shuffle, Star } from 'lucide-react';

export default function Recommendation({ movie, onRecommend, isLoading }) {
  return (
    <div className="flex flex-col items-center mb-16 px-4">
      <button 
        onClick={onRecommend}
        disabled={isLoading}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/25 border border-white/10 transform transition-all duration-300 hover:-translate-y-1 active:translate-y-0 mb-8 disabled:opacity-50"
      >
        <Shuffle size={20} />
        Surprise Me
      </button>

      {movie && (
        <div className="w-full max-w-3xl relative rounded-3xl p-1 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 backdrop-blur-xl animate-[fadeIn_0.5s_ease-out]">
          {/* Inner Glass Card */}
          <div className="flex flex-col md:flex-row gap-6 bg-black/60 rounded-[1.4rem] p-6 backdrop-blur-2xl border border-white/10">
            <img 
              src={movie.image} 
              alt={movie.title} 
              className="w-full md:w-56 h-auto rounded-xl object-cover shadow-2xl"
            />
            <div className="flex flex-col justify-center flex-1">
              <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs mb-2">Featured Pick</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">{movie.title}</h2>
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-white/10 rounded-md border border-white/10 text-sm text-gray-300">
                  {movie.genre}
                </span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-md border border-yellow-500/20 text-sm font-bold flex items-center gap-1">
                  <Star size={14} fill="currentColor" /> {movie.rating}
                </span>
                <span className="text-gray-400 text-sm">{movie.year}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}