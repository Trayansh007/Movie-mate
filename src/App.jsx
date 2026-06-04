import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Header from './components/Header';
import Controls from './components/Controls';
import Recommendation from './components/Recommendation';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import Collections from './components/Collections';
import CollectionModal from './components/CollectionModal';
import ProfileModal from './components/ProfileModal';

const API_KEY = '7474b6bafbbe926928fb0a0a8d681205'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('movieMateUser');
    return savedUser ? JSON.parse(savedUser) : null;
  }); 
  
  const [activeView, setActiveView] = useState("home"); 
  const [selectedMovieId, setSelectedMovieId] = useState(null); 
  const [movieToCollect, setMovieToCollect] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [recommendedMovie, setRecommendedMovie] = useState(null);
  const [aiMovies, setAiMovies] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('movieMateUser', JSON.stringify(userData)); 
  };

  const handleLogout = () => {
    setUser(null);
    setAiMovies([]); 
    setSelectedMovieId(null);
    setActiveView("home");
    localStorage.removeItem('movieMateUser'); 
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        const { user: savedUser } = await response.json();
        setUser(savedUser);
        localStorage.setItem('movieMateUser', JSON.stringify(savedUser));
        if (JSON.stringify(user.genres) !== JSON.stringify(updatedData.genres)) {
           fetchAiRecommendations(updatedData.genres);
        }
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  const handleGoHome = () => {
    setSelectedGenre("All");
    setSearchTerm("");
    setSelectedMovieId(null);
    setActiveView("home");
  };

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
      if (response.ok) setAiMovies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchMovies = async (searchQuery = "", genreId = "All") => {
    setIsLoading(true);
    try {
      let endpoint = searchQuery 
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchQuery}`
        : genreId !== "All" 
          ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
          : `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;

      const response = await fetch(endpoint);
      const data = await response.json();
      const formatted = data.results.map(movie => ({
        id: movie.id,
        title: movie.title || movie.name,
        genre: GENRES.find(g => movie.genre_ids?.includes(parseInt(g.id)))?.name || "Other",
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
        year: movie.release_date ? movie.release_date.split('-')[0] : "N/A",
        image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "https://placehold.co/300x450/111827/ffffff?text=No+Poster"
      }));
      setMovies(formatted.filter(m => !m.image.includes('No+Poster')));
    } catch (err) {
      setError("Failed to load movies.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.genres?.length > 0 && aiMovies.length === 0) fetchAiRecommendations(user.genres);
    const delay = setTimeout(() => fetchMovies(searchTerm, selectedGenre), 500);
    return () => clearTimeout(delay);
  }, [searchTerm, selectedGenre, user]);

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white font-sans selection:bg-cyan-500/30">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onGoHome={handleGoHome} 
        onGoToCollections={() => setActiveView("collections")} 
        onOpenProfile={() => setShowProfile(true)}
      />
      
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onSave={handleUpdateProfile} />}
      {movieToCollect && <CollectionModal movie={movieToCollect} user={user} onClose={() => setMovieToCollect(null)} />}

      {activeView === "collections" && <Collections user={user} onMovieClick={(id) => { setSelectedMovieId(id); setActiveView("details"); }} />}
      {activeView === "details" && selectedMovieId && <MovieDetails movieId={selectedMovieId} onBack={handleGoHome} onAddToCollection={setMovieToCollect} />}
      
      {activeView === "home" && (
        <main className="relative z-10 pt-8">
          <Controls searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedGenre={selectedGenre} setSelectedGenre={setSelectedGenre} genres={GENRES.filter(g => g.id !== "All")} />
          <Recommendation movie={recommendedMovie} onRecommend={() => setRecommendedMovie(movies[Math.floor(Math.random() * movies.length)])} isLoading={isLoading} onMovieClick={(id) => { setSelectedMovieId(id); setActiveView("details"); }} />
          {user.genres?.length > 0 && !searchTerm && selectedGenre === "All" && (
            <div className="mb-8">
              <MovieGrid movies={aiMovies} isLoading={isAiLoading} error={null} selectedGenre="For You ✨" onMovieClick={(id) => { setSelectedMovieId(id); setActiveView("details"); }} onAddClick={setMovieToCollect} />
            </div>
          )}
          <MovieGrid movies={movies} isLoading={isLoading} error={error} selectedGenre={GENRES.find(g => g.id === selectedGenre)?.name} onMovieClick={(id) => { setSelectedMovieId(id); setActiveView("details"); }} onAddClick={setMovieToCollect} />
        </main>
      )}
    </div>
  );
}