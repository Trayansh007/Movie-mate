import React, { useState, useEffect } from 'react';
import { Layers, Film } from 'lucide-react';
import MovieCard from './MovieCard';

export default function Collections({ user, onMovieClick }) {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/collections?email=${user.email}`);
        const data = await res.json();
        if (res.ok) setCollections(data);
      } catch (err) {
        console.error("Failed to load collections", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, [user.email]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-cyan-500">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
        <p className="text-gray-400">Loading your vault...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 pb-24 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-6">
        <div className="p-3 bg-gradient-to-tr from-purple-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/20">
          <Layers size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          My Collections
        </h1>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
          <Film size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-xl text-gray-400">You haven't created any collections yet.</p>
          <p className="text-gray-500 mt-2">Click the '+' icon on any movie to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {collections.map(col => (
            <div key={col._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white border-l-4 border-cyan-500 pl-3">
                  {col.name}
                </h2>
                <span className="text-sm font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  {col.movies.length} Movies
                </span>
              </div>
              
              {col.movies.length === 0 ? (
                <p className="text-gray-500 italic">This collection is empty.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {col.movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie.id)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}