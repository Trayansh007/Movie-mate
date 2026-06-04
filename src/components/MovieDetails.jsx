import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Calendar, Clock, Image as ImageIcon, Users, FolderPlus } from 'lucide-react'; // Added FolderPlus

const API_KEY = '7474b6bafbbe926928fb0a0a8d681205';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const ORIGINAL_IMAGE_URL = 'https://image.tmdb.org/t/p/original';

// Added onAddToCollection to props
export default function MovieDetails({ movieId, onBack, onAddToCollection }) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=images,watch/providers,credits`
        );
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [movieId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-cyan-500">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
        <p className="text-gray-400">Loading details...</p>
      </div>
    );
  }

  if (!details) return null;

  const inProviders = details['watch/providers']?.results?.['IN'];
  const streamProvider = inProviders?.flatrate?.[0] || inProviders?.rent?.[0] || inProviders?.buy?.[0];
  
  const directSearchLink = streamProvider 
    ? `https://www.google.com/search?q=watch+${encodeURIComponent(details.title)}+on+${encodeURIComponent(streamProvider.provider_name)}`
    : null;

  const gallery = details.images?.backdrops?.slice(0, 6) || [];
  const cast = details.credits?.cast?.slice(0, 10) || [];

  // Helper function to format the movie object perfectly for our Collection Database
  const handleSaveToCollection = () => {
    if (onAddToCollection) {
      onAddToCollection({
        id: details.id,
        title: details.title,
        image: details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : "https://placehold.co/300x450/111827/ffffff?text=No+Poster",
        genre: details.genres?.[0]?.name || "Other", // Grab the primary genre
        rating: details.vote_average ? details.vote_average.toFixed(1) : "N/A",
        year: details.release_date ? details.release_date.split('-')[0] : "N/A"
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-[fadeIn_0.4s_ease-out]">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Explore
      </button>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Column: Poster & Action Buttons */}
        <div className="w-full md:w-1/3 flex flex-col items-center max-w-sm mx-auto">
          <img 
            src={details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : "https://placehold.co/300x450/111827/ffffff?text=No+Poster"} 
            alt={details.title}
            className="w-full rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10"
          />
          
          {/* Action Row */}
          <div className="w-full mt-6 flex flex-col gap-3">
            {streamProvider && directSearchLink ? (
              <a 
                href={directSearchLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] transition-all duration-300 transform hover:-translate-y-1"
              >
                <img 
                  src={`${ORIGINAL_IMAGE_URL}${streamProvider.logo_path}`} 
                  alt={streamProvider.provider_name} 
                  className="w-8 h-8 rounded-lg shadow-md bg-white"
                />
                Watch on {streamProvider.provider_name}
              </a>
            ) : (
              <div className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-center text-gray-400 backdrop-blur-sm">
                Not currently streaming in India
              </div>
            )}

            {/* NEW: Save to Collection Button */}
            <button 
              onClick={handleSaveToCollection}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all duration-300 group"
            >
              <FolderPlus size={20} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
              Save to Collection
            </button>
          </div>
        </div>

        {/* Right Column: Text Details & Galleries */}
        <div className="w-full md:w-2/3 flex flex-col">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            {details.title}
          </h1>
          
          {details.tagline && (
            <p className="text-gray-400 italic mb-6 text-lg">{details.tagline}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/20 font-bold">
              <Star size={16} fill="currentColor" /> {details.vote_average?.toFixed(1)}
            </span>
            {details.release_date && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg border border-white/10">
                <Calendar size={16} /> {details.release_date}
              </span>
            )}
            {details.runtime > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg border border-white/10">
                <Clock size={16} /> {details.runtime} mins
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {details.genres?.map(genre => (
              <span key={genre.id} className="px-4 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30 text-sm font-medium">
                {genre.name}
              </span>
            ))}
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">Overview</h3>
          <p className="text-gray-300 text-lg leading-relaxed mb-10">
            {details.overview || "No overview available."}
          </p>

          {/* Cast Section */}
          {cast.length > 0 && (
            <div className="mb-10">
              <h3 className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
                <Users size={24} className="text-cyan-400" /> Top Cast
              </h3>
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {cast.map(actor => (
                  <div key={actor.id} className="flex-none w-32 snap-start group">
                    <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/10 bg-white/5">
                      <img 
                        src={actor.profile_path ? `${IMAGE_BASE_URL}${actor.profile_path}` : "https://placehold.co/200x300/111827/ffffff?text=No+Image"} 
                        alt={actor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-white text-sm font-bold truncate" title={actor.name}>
                      {actor.name}
                    </p>
                    <p className="text-gray-400 text-xs truncate" title={actor.character}>
                      {actor.character}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Gallery Section */}
          {gallery.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
                <ImageIcon size={24} className="text-cyan-400" /> Image Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-white/10">
                    <img 
                      src={`${IMAGE_BASE_URL}${img.file_path}`} 
                      alt={`Gallery ${idx}`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}