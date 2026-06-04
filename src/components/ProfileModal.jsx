import React, { useState } from 'react';
import { X, Check, User, Mail, Phone, Edit3, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

const ALL_GENRES = [
  "Action", "Sci-Fi", "Comedy", "Horror", "Drama", 
  "Animation", "Romance", "Thriller", "Fantasy", "Documentary"
];

export default function ProfileModal({ user, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: user.username || user.email.split('@')[0], 
    email: user.email,
    phone: user.phone || "",
    bio: user.bio || "",
    genres: user.genres || []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 10) {
        setFormData({ ...formData, [name]: onlyNums });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const toggleGenre = (genre) => {
    if (!isEditing) return;
    const currentGenres = formData.genres;
    if (currentGenres.includes(genre)) {
      setFormData({ ...formData, genres: currentGenres.filter(g => g !== genre) });
    } else {
      if (currentGenres.length < 5) {
        setFormData({ ...formData, genres: [...currentGenres, genre] });
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError("");
    if (formData.phone && formData.phone.length !== 10) {
      setError("Please fix the errors before saving.");
      return;
    }
    onSave(formData);
    setIsEditing(false);
  };

  const userInitial = formData.username ? formData.username.charAt(0).toUpperCase() : "U";
  const isPhoneInvalid = formData.phone.length > 0 && formData.phone.length < 10;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full max-w-xl bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/80 via-[#0a0a0a]/80 to-black/80 border border-white/10 rounded-[2.5rem] shadow-[0_10px_50px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col max-h-[90vh] transform animate-[scaleIn_0.3s_ease-out]">
        
        {/* Header */}
        <div className="relative z-20 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
              <User size={20} className="text-cyan-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">My Profile</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-cyan-500/20 text-white rounded-xl border border-white/10 transition-all">
                <Edit3 size={16} className="text-cyan-400" />
                <span className="hidden sm:block text-sm font-semibold">Edit</span>
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isPhoneInvalid}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-all shadow-lg ${isPhoneInvalid ? "bg-gray-700 opacity-50" : "bg-gradient-to-r from-cyan-600 to-blue-600"}`}
              >
                <Check size={16} />
                <span className="hidden sm:block text-sm font-semibold">Save</span>
              </button>
            )}
            <button type="button" onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="relative z-10 pt-8 px-6 sm:px-10 pb-10 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Fixed Letter Avatar */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center justify-center">
              <span className="text-5xl font-extrabold text-cyan-500">{userInitial}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-white tracking-tight">{formData.username}</h2>
            <p className="text-gray-400 text-sm font-medium mt-1">{formData.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Username</label>
              <div className="relative flex items-center">
                <User size={18} className="absolute left-4 text-cyan-400" />
                <input 
                  type="text" name="username" value={formData.username} onChange={handleChange} disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl text-white transition-all outline-none ${isEditing ? "bg-white/5 border border-white/10" : "bg-transparent border-transparent"}`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Phone Number</label>
              <div className="relative flex items-center">
                <Phone size={18} className="absolute left-4 text-cyan-400" />
                <input 
                  type="tel" name="phone" placeholder={isEditing ? "10 digits" : "Not provided"} value={formData.phone} onChange={handleChange} disabled={!isEditing} maxLength={10}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl text-white transition-all outline-none ${isEditing ? "bg-white/5 border border-white/10" : "bg-transparent border-transparent"}`}
                />
              </div>
              {isEditing && isPhoneInvalid && <p className="text-[11px] text-red-400 mt-1 ml-1">Must be 10 digits ({formData.phone.length}/10)</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Bio</label>
              <div className="relative flex">
                <BookOpen size={18} className="absolute left-4 top-3.5 text-cyan-400" />
                <textarea 
                  name="bio" placeholder={isEditing ? "Bio..." : "No bio added."} value={formData.bio} onChange={handleChange} disabled={!isEditing} rows="3"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl text-white transition-all outline-none resize-none ${isEditing ? "bg-white/5 border border-white/10" : "bg-transparent border-transparent"}`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Favorite Genres</label>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map(genre => (
                  <button
                    key={genre} type="button" disabled={!isEditing} onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${formData.genres.includes(genre) ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" : "bg-white/5 text-gray-500 border-white/5"}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}