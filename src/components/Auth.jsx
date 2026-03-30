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
  const [errorMsg, setErrorMsg] = useState(""); // New state for backend errors
  const [isLoading, setIsLoading] = useState(false); // New loading state

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

    // Frontend Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password) return;
    if (!isLogin && favGenres.length === 0) {
      setErrorMsg("Please select at least 1 favorite genre!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: isLogin ? 'login' : 'signup', // Tell Python what we are doing!
          email, 
          password, 
          genres: isLogin ? [] : favGenres 
        })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin({ email: data.email, genres: data.genres });
      } else {
        // This will now properly show "Email already exists" or "Account not found"
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-500">
        
        <div className="flex flex-col items-center mb-8 text-white">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/30">
            <Film size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {isLogin ? "Welcome Back" : "Join MovieMate"}
          </h1>
        </div>

        {/* Display Backend Errors Here */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm text-center backdrop-blur-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              required
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              required
            />
          </div>

          {!isLogin && (
            <div className="mt-2 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-end mb-3">
                <p className="text-sm font-semibold text-gray-300">Select Top 5 Genres:</p>
                <span className={`text-xs font-bold ${favGenres.length === 5 ? 'text-cyan-400' : 'text-gray-500'}`}>
                  {favGenres.length} / 5
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map(genre => {
                  const isSelected = favGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all border ${
                        isSelected 
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                          : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={12} className="inline mr-1 mb-0.5" />}
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="group flex items-center justify-center gap-2 w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
          >
            {isLoading ? "Connecting..." : isLogin ? (
              <><LogIn size={20} /> Sign In</>
            ) : (
              <><UserPlus size={20} /> Create Account</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setFavGenres([]);
              setErrorMsg("");
            }}
            className="text-gray-400 hover:text-cyan-400 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto group"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}