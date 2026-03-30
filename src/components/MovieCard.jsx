import React from 'react';
import { Star } from 'lucide-react';

export default function MovieCard({ movie }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(6,182,212,0.2)]">
      
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={movie.image} 
          alt={movie.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        {/* Dark gradient overlay that becomes more opaque on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Floating Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1 text-yellow-400 text-sm font-bold">
          <Star size={12} fill="currentColor" /> {movie.rating}
        </div>
      </div>

      {/* Text Content (pulled up over the image via negative margin) */}
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 drop-shadow-lg">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="px-2 py-1 bg-white/10 rounded backdrop-blur-md">{movie.genre}</span>
          <span>{movie.year}</span>
        </div>
      </div>
      
    </div>
  );
}