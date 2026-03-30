import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Header from './components/Header';
import Controls from './components/Controls';
import Recommendation from './components/Recommendation';
import MovieGrid from './components/MovieGrid';

const API_KEY = '7474b6bafbbe926928fb0a0a8d681205'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Updated Genres to perfectly match Auth.jsx and TMDB's official IDs
const GENRES = [
  { id: "All", name: "Trending" },
  { id: "28", name: "Action" },
  { id: "878", name: "Sci-Fi" },
  { id: "35", name: "Comedy" },
  { id: "27", name: "Horror" },
  { id: "18", name: "Drama" },
  { id: "16", name: "Animation" },
  { id: "10749", name: "Romance" },
  { id: "53", name: "Thriller" },
  { id: "14", name: "Fantasy" },
  { id: "99", name: "Documentary" }
];

export default function App() {
  // 1. Initialize user from localStorage to keep them logged in across refreshes
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('movieMateUser');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 
  
  // Standard TMDB States
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedMovie, setRecommendedMovie] = useState(null);

  // AI States
  const [aiMovies, setAiMovies] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- Session Handlers ---
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('movieMateUser', JSON.stringify(userData)); 
  };

  const handleLogout = () => {
    setUser(null);
    setAiMovies([]); // Clear AI movies on logout
    localStorage.removeItem('movieMateUser'); 
  };

  // --- Fetching Logic ---
  const fetchAiRecommendations = async (genres) => {
    if (!genres || genres.length === 0) return;
    
    setIsAiLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genres })
      });
      
      const data = await response.json();
      if (response.ok) {
        setAiMovies(data);
      }
    } catch (err) {
      console.error("Failed to fetch AI recommendations from Python backend:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchMovies = async (searchQuery = "", genreId = "All") => {
    setIsLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (searchQuery) {
        endpoint = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchQuery}`;
      } else if (genreId !== "All") {
        endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
      } else {
        endpoint = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch movies");
      const data = await response.json();
      
      const formattedMovies = data.results.map(movie => ({
        id: movie.id,
        title: movie.title || movie.name,
        genre: GENRES.find(g => movie.genre_ids?.includes(parseInt(g.id)))?.name || "Other",
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
        year: movie.release_date ? movie.release_date.split('-')[0] : (movie.first_air_date ? movie.first_air_date.split('-')[0] : "N/A"),
        image: movie.poster_path 
          ? `${IMAGE_BASE_URL}${movie.poster_path}` 
          : "https://placehold.co/300x450/111827/ffffff?text=No+Poster"
      }));

      setMovies(formattedMovies.filter(m => !m.image.includes('No+Poster')));
    } catch (err) {
      setError("Oops! Couldn't load movies. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (!user) return; 

    // Trigger AI fetch only once when the user logs in and has genres
    if (user.genres && user.genres.length > 0 && aiMovies.length === 0) {
      fetchAiRecommendations(user.genres);
    }

    const delayDebounceFn = setTimeout(() => {
      fetchMovies(searchTerm, selectedGenre);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedGenre, user]);

  const handleRecommend = () => {
    if (movies.length === 0) return;
    const randomIndex = Math.floor(Math.random() * movies.length);
    setRecommendedMovie(movies[randomIndex]);
  };

  // --- Authentication Intercept ---
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // --- Main App Render ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white font-sans selection:bg-cyan-500/30">
      
      <Header user={user} onLogout={handleLogout} />
      
      <main className="relative z-10 pt-8">
        <Controls 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          selectedGenre={selectedGenre} 
          setSelectedGenre={setSelectedGenre} 
          genres={GENRES} 
        />
        
        <Recommendation 
          movie={recommendedMovie} 
          onRecommend={handleRecommend} 
          isLoading={isLoading} 
        />
        
        {/* AI "For You" Section */}
        {user.genres && user.genres.length > 0 && !searchTerm && selectedGenre === "All" && (
          <div className="mb-8">
            <MovieGrid 
              movies={aiMovies} 
              isLoading={isAiLoading} 
              error={null} 
              selectedGenre="For You ✨" 
            />
          </div>
        )}

        {/* Standard Explore Grid */}
        <MovieGrid 
          movies={movies} 
          isLoading={isLoading} 
          error={error} 
          selectedGenre={GENRES.find(g => g.id === selectedGenre)?.name}
        />
      </main>
      
    </div>
  );
}