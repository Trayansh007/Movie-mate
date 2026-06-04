import os
import json
import requests
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from google import genai

# Load secret keys
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- 1. MONGODB CONNECTION ---
client = MongoClient(os.getenv("MONGODB_URI"))
db = client.moviemate 
users_collection = db.users 
collections_db = db.collections 

print("✅ Connected to MongoDB")

# --- 2. AUTHENTICATION ROUTE ---
@app.route('/api/auth', methods=['POST'])
def auth():
    data = request.json
    action = data.get('action') 
    email = data.get('email')
    password = data.get('password')
    genres = data.get('genres', [])

    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({'error': 'Please provide a valid email address.'}), 400

    user = users_collection.find_one({'email': email})

    if action == 'signup':
        if user:
            return jsonify({'error': 'An account with this email already exists!'}), 409
        
        new_user = {
            'email': email, 
            'password': password, 
            'genres': genres,
            'username': email.split('@')[0],
            'phone': "",
            'bio': ""
            # Photo field removed
        }
        users_collection.insert_one(new_user)
        new_user.pop('password', None)
        new_user['_id'] = str(new_user['_id'])
        return jsonify(new_user), 201

    elif action == 'login':
        if not user:
            return jsonify({'error': 'No account found with this email. Please sign up.'}), 404
        
        if user['password'] != password:
            return jsonify({'error': 'Incorrect password!'}), 401
            
        user['_id'] = str(user['_id'])
        user.pop('password', None) 
        return jsonify(user), 200

    return jsonify({'error': 'Invalid action'}), 400

# --- 3. PROFILE UPDATE ROUTE ---
@app.route('/api/profile/update', methods=['PUT'])
def update_profile():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    update_fields = {
        'username': data.get('username'),
        'phone': data.get('phone'),
        'bio': data.get('bio'),
        'genres': data.get('genres')
        # Photo field removed
    }
    
    update_fields = {k: v for k, v in update_fields.items() if v is not None}
    
    users_collection.update_one({'email': email}, {'$set': update_fields})
    
    updated_user = users_collection.find_one({'email': email})
    updated_user['_id'] = str(updated_user['_id'])
    updated_user.pop('password', None)
    
    return jsonify({'message': 'Profile updated successfully', 'user': updated_user}), 200

# --- 4. RECOMMENDATION ROUTE ---
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    genres = data.get('genres', [])
    try:
        ai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        prompt = f"Based on genres: {', '.join(genres)}, recommend 5 movies. Return ONLY a valid JSON array of strings."
        response = ai_client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        movie_titles = json.loads(response.text.replace('```json', '').replace('```', '').strip())

        final_movies = []
        tmdb_key = os.getenv("TMDB_API_KEY")
        for title in movie_titles:
            res = requests.get(f"https://api.themoviedb.org/3/search/movie?api_key={tmdb_key}&query={title}").json()
            if res.get('results'):
                movie = res['results'][0]
                final_movies.append({
                    'id': movie['id'], 'title': movie['title'], 'genre': "For You ✨",
                    'rating': round(movie['vote_average'], 1), 'year': movie['release_date'].split('-')[0],
                    'image': f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
                })
        return jsonify(final_movies), 200
    except Exception:
        return jsonify({'error': 'Failed to generate recommendations'}), 500

# --- 5. COLLECTIONS ROUTES ---
@app.route('/api/collections', methods=['GET'])
def get_collections():
    email = request.args.get('email')
    user_collections = list(collections_db.find({'email': email}))
    for col in user_collections: col['_id'] = str(col['_id'])
    return jsonify(user_collections), 200

@app.route('/api/collections', methods=['POST'])
def create_collection():
    data = request.json
    new_col = {'email': data.get('email'), 'name': data.get('name'), 'movies': []}
    result = collections_db.insert_one(new_col)
    new_col['_id'] = str(result.inserted_id)
    return jsonify(new_col), 201

@app.route('/api/collections/add', methods=['POST'])
def add_to_collection():
    data = request.json
    collection = collections_db.find_one({'_id': ObjectId(data.get('collectionId')), 'email': data.get('email')})
    if not collection: return jsonify({'error': 'Not found'}), 404
    if any(m.get('id') == data.get('movie').get('id') for m in collection.get('movies', [])):
        return jsonify({'error': 'Exists'}), 409
    collections_db.update_one({'_id': ObjectId(data.get('collectionId'))}, {'$push': {'movies': data.get('movie')}})
    return jsonify({'message': 'Success'}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)