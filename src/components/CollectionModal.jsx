import React, { useState, useEffect } from 'react';
import { X, Plus, FolderPlus, Check } from 'lucide-react';

export default function CollectionModal({ movie, user, onClose }) {
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/collections?email=${user.email}`);
        const data = await res.json();
        if (res.ok) setCollections(data);
      } catch (err) {
        console.error("Failed to fetch collections", err);
      }
    };
    fetchCollections();
  }, [user.email]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: newCollectionName })
      });
      const data = await res.json();
      if (res.ok) {
        setCollections([...collections, data]);
        setNewCollectionName("");
      }
    } catch (err) {
      setMessage("Error creating collection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/collections/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          collectionId, 
          movie: {
            id: movie.id,
            title: movie.title,
            image: movie.image,
            genre: movie.genre,
            rating: movie.rating,
            year: movie.year
          } 
        })
      });
      
      if (res.ok) {
        setMessage("Added successfully!");
        setTimeout(onClose, 1500);
      } else {
        setMessage("Movie already in collection!");
      }
    } catch (err) {
      setMessage("Error saving movie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">Save to Collection</h2>
        <p className="text-cyan-400 font-medium mb-6 line-clamp-1">{movie.title}</p>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 text-center text-sm font-medium text-cyan-300">
            {message}
          </div>
        )}

        <div className="max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar flex flex-col gap-2">
          {collections.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No collections yet.</p>
          ) : (
            collections.map(col => (
              <button 
                key={col._id}
                onClick={() => handleAddToCollection(col._id)}
                disabled={isLoading}
                className="flex items-center justify-between w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 transition-all text-left group disabled:opacity-50"
              >
                <span className="text-white font-medium">{col.name}</span>
                <Plus size={18} className="text-gray-500 group-hover:text-cyan-400" />
              </button>
            ))
          )}
        </div>

        <form onSubmit={handleCreateCollection} className="flex gap-2">
          <input 
            type="text" 
            placeholder="New collection name..." 
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button 
            type="submit"
            disabled={isLoading || !newCollectionName.trim()}
            className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 transition-colors"
            title="Create Collection"
          >
            <FolderPlus size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}