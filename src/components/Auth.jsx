import React, { useState } from 'react';
import { Mail, Lock, Film, ArrowRight, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';

const ALL_GENRES = [
  "Action", "Sci-Fi", "Comedy", "Horror", "Drama", 
  "Animation", "Romance", "Thriller", "Fantasy", "Documentary"
];

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favGenres, setFavGenres] = useState([]);
  const [errorMsg, setErrorMsg] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); 

  const toggleGenre = (genre) => {
    if (favGenres.includes(genre)) {
      setFavGenres(favGenres.filter(g => g !== genre));
    } else {
      if (favGenres.length < 5) {
        setFavGenres([...favGenres, genre]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: isLogin ? 'login' : 'signup', 
          email, 
          password, 
          genres: isLogin ? [] : favGenres 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // FIXED: Now passing the ENTIRE data object (including bio, phone, etc.)
        // Instead of just { email, genres }
        onLogin(data); 
      } else {
        setErrorMsg(data.error || "Authentication failed.");
      }
    } catch (err) {
      setErrorMsg("Cannot connect to server. Is your Python backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        
        <div className="flex flex-col items-center mb-8 text-white">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/30">
            <Film size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {isLogin ? "Welcome Back" : "Join MovieMate"}
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="email" placeholder="Email Address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>

          {!isLogin && (
            <div className="mt-2 animate-[fadeIn_0.3s_ease-out]">
              <p className="text-sm font-semibold text-gray-300 mb-3">Select Top 5 Genres:</p>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map(genre => (
                  <button
                    key={genre} type="button" onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      favGenres.includes(genre) 
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" 
                        : "bg-white/5 text-gray-400 border-white/5"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg shadow-lg disabled:opacity-50 transition-all"
          >
            {isLoading ? "Connecting..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
            className="text-gray-400 hover:text-cyan-400 text-sm font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}