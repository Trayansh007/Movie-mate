import React from 'react';
import MovieCard from './MovieCard';
import { Film } from 'lucide-react';

export default function MovieGrid({ movies, isLoading, error, selectedGenre }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Film size={40} className="text-cyan-500 animate-spin-slow mb-4 opacity-50" />
        <p className="text-gray-400 text-lg">Loading masterpieces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center backdrop-blur-md">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-xl">No movies found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-24">
      <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-3">
        {selectedGenre === "All" ? "Popular Right Now" : `${selectedGenre} Movies`}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}