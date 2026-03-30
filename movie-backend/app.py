import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from google import genai

# Load the secret keys from the .env file
load_dotenv()

# Initialize the Flask app
app = Flask(__name__)
CORS(app) # Allow React to connect to this server

# --- 1. MONGODB CONNECTION ---
# Connect to your local MongoDB database
client = MongoClient(os.getenv("MONGODB_URI"))
db = client.moviemate 
users_collection = db.users # This will automatically create a 'users' collection

print("✅ Connected to MongoDB")


import re # Add this to the very top of your app.py file with your other imports!

# --- 2. AUTHENTICATION ROUTE (Sign In / Sign Up) ---
@app.route('/api/auth', methods=['POST'])
def auth():
    data = request.json
    action = data.get('action') # New: 'login' or 'signup'
    email = data.get('email')
    password = data.get('password')
    genres = data.get('genres', [])

    # 1. Validate Email Format
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({'error': 'Please provide a valid email address.'}), 400

    # 2. Check if user already exists
    user = users_collection.find_one({'email': email})

    # --- SIGN UP LOGIC ---
    if action == 'signup':
        if user:
            return jsonify({'error': 'An account with this email already exists!'}), 409
        
        # Create new user
        new_user = {'email': email, 'password': password, 'genres': genres}
        users_collection.insert_one(new_user)
        return jsonify({'message': 'Account created!', 'email': email, 'genres': genres}), 201

    # --- LOGIN LOGIC ---
    elif action == 'login':
        if not user:
            return jsonify({'error': 'No account found with this email. Please sign up.'}), 404
        
        if user['password'] != password:
            return jsonify({'error': 'Incorrect password!'}), 401
            
        return jsonify({'message': 'Login successful!', 'email': user['email'], 'genres': user.get('genres', [])}), 200

    return jsonify({'error': 'Invalid action'}), 400

# --- 3. GEMINI + TMDB RECOMMENDATION ROUTE ---
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    genres = data.get('genres', [])

    if not genres:
        return jsonify({'error': 'No genres provided.'}), 400
        
    try:
        # A. Ask Gemini for movie titles based on the user's saved genres
        ai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        
        # We give Gemini strict instructions to ONLY return a JSON array of strings
        prompt = f"Based on these genres: {', '.join(genres)}, recommend 5 great movies. Return ONLY a valid JSON array of strings containing the movie titles. Do not include markdown formatting, code blocks, or any other text. Example: [\"Inception\", \"The Matrix\"]"
        
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        # Clean up Gemini's text and turn it into a Python list
        raw_text = response.text.replace('```json', '').replace('```', '').strip()
        movie_titles = json.loads(raw_text)

        # B. Ask TMDB for the details (Posters, ratings, years) of those specific movies
        final_movies = []
        tmdb_key = os.getenv("TMDB_API_KEY")
        
        for title in movie_titles:
            # Search TMDB for the exact title Gemini gave us
            tmdb_url = f"https://api.themoviedb.org/3/search/movie?api_key={tmdb_key}&query={title}"
            res = requests.get(tmdb_url).json()
            
            # If TMDB found the movie, format it for our React frontend
            if res.get('results'):
                movie = res['results'][0] # Get the top search result
                
                final_movies.append({
                    'id': movie['id'],
                    'title': movie['title'],
                    'genre': "For You ✨",
                    'rating': round(movie['vote_average'], 1) if movie.get('vote_average') else "N/A",
                    'year': movie['release_date'].split('-')[0] if movie.get('release_date') else "N/A",
                    'image': f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get('poster_path') else "https://placehold.co/300x450/111827/ffffff?text=No+Poster"
                })

        # C. Send the beautifully formatted list back to React
        return jsonify(final_movies), 200

    except Exception as e:
        print("Recommendation Error:", e)
        return jsonify({'error': 'Failed to generate recommendations'}), 500


# Start the server on port 5000
if __name__ == '__main__':
    app.run(port=5000, debug=True)